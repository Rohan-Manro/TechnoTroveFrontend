import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Importing useFocusEffect hook
import filledHeart from './assets/filled_heart.png'; // Path to your filled heart image
import emptyHeart from './assets/empty_heart.png'; // Path to your empty heart image

const categories = ['All', 'Mobile Phones', 'Laptops', 'Televisions', 'Headphones', 'Consoles', 'Favorite'];

const Home = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState({}); // To track favorite products
  const [searchQuery, setSearchQuery] = useState('');

  // Function to fetch products based on category
  const fetchProducts = async (category) => {
    setLoading(true);
    try {
      let apiUrl;
      if (category === 'All') {
        apiUrl = 'http://10.0.2.2:8080/api';
      } else if (category === 'Favorite') {
        apiUrl = 'http://10.0.2.2:8080/api/favorites';
      } else {
        apiUrl = `http://10.0.2.2:8080/api/${category}`;
      }

      const response = await axios.get(apiUrl);
      const transformedProducts = response.data.map((item) => ({
        id: item.sku_id.toString(),
        name: item.name,
        price: `$${item.price}`,
        image: item.image1_url,
        inCart: item.inCart,
      }));

      setProducts(transformedProducts);
      setFilteredProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  // UseEffect to initially fetch products based on the selected category
  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  // UseFocusEffect to re-fetch products when the Home screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchProducts(selectedCategory); // Re-fetch products when the page gains focus
    }, [selectedCategory])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProducts(products); // Show all products if search is cleared
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const toggleFavorite = async (productId) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = { ...prevFavorites };
      updatedFavorites[productId] = !updatedFavorites[productId]; // Toggle the favorite state
      return updatedFavorites;
    });

    try {
      const response = await axios.patch(`http://10.0.2.2:8080/api/favorites/${productId}`);
      const message = response.data.message;

      setFavorites((prevFavorites) => {
        const updatedFavorites = { ...prevFavorites };
        if (message === 'Product added to favorites.') {
          updatedFavorites[productId] = true;
        } else if (message === 'Product removed from favorites.') {
          updatedFavorites[productId] = false;
        }
        return updatedFavorites;
      });

      if (selectedCategory === 'Favorite') {
        fetchProducts('Favorite'); // Re-fetch the "Favorite" category
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleProductClick = async (sku_id) => {
    try {
      const response = await axios.get(`http://10.0.2.2:8080/api/products/${sku_id}`);
      const productData = response.data;
      navigation.navigate('ProductDescriptionPage', { productData });
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const addToCart = async (sku_id) => {
    try {
      await axios.patch(`http://10.0.2.2:8080/api/cart/add/${sku_id}`);
      fetchProducts(selectedCategory);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const renderProduct = ({ item }) => {
    const imageUrl = item.image ? item.image.replace('localhost', '10.0.2.2') : null;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductClick(item.id)}
      >
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item.id)}
        >
          <Image
            source={favorites[item.id] ? filledHeart : emptyHeart}
            style={styles.heartImage}
          />
        </TouchableOpacity>

        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
        ) : (
          <Text style={styles.noImageText}>No image available</Text>
        )}

        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>

        {item.inCart === false && (
          <TouchableOpacity 
            style={styles.addToCartButton} 
            onPress={() => addToCart(item.id)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartText}>🛒</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <View>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      <Text style={styles.sectionTitle}>Popular Products</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FF5722" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productsContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', paddingHorizontal: 16, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  cartText: { fontSize: 24, color: '#333' },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  categoriesContainer: { marginBottom: 10, height: 40, paddingBottom: 5 },
  categoryButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f1f1f1', marginRight: 10 },
  selectedCategoryButton: { backgroundColor: '#FF5722' },
  categoryText: { fontSize: 14, color: '#333' },
  selectedCategoryText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  row: { justifyContent: 'space-between' },
  productsContainer: { paddingBottom: 20 },
  productCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, width: '48%', alignItems: 'center' },
  productImage: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 10 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
  productPrice: { fontSize: 14, color: '#FF5722', marginVertical: 8 },
  addToCartButton: { backgroundColor: '#FF5722', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 12 },
  addToCartText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  loader: { marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 20 },
  heartImage: { width: 24, height: 24, resizeMode: 'contain' },
  favoriteIcon: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
  noImageText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
});

export default Home;

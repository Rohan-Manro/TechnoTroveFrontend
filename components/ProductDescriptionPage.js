import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper'; // Import Swiper

const ProductDescriptionPage = ({ route, navigation }) => {
  const { productData } = route.params;

  // Identify the active variant based on active_var
  const activeVariant = [productData.var1, productData.var2, productData.var3].find(
    (variant) => variant.sku_id === productData.active_var
  );

  const otherVariants = [
    productData.var1,
    productData.var2,
    productData.var3,
  ].filter(variant => variant.sku_id !== activeVariant.sku_id);

  // Ensure image URLs are properly defined and create an array of images
  const images = [
    activeVariant.image1_url,
    activeVariant.image2_url,
    activeVariant.image3_url
  ];

  // Handle error for image loading
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle variant click
  const handleVariantClick = async (sku_id) => {
    try {
      const response = await axios.get(`http://10.0.2.2:8080/api/products/${sku_id}`);
      const productData = response.data;
      navigation.navigate('ProductDescriptionPage', { productData });
    } catch (error) {
      console.error('Error fetching product data:', error);
      Alert.alert('Error', 'Failed to fetch product details. Please try again later.');
    }
  };

  const addToCart = async () => {
    try {
      await axios.patch(`http://10.0.2.2:8080/api/cart/add/${activeVariant.sku_id}`);
      Alert.alert('Success', 'Product added to cart.');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart. Please try again later.');
    }
  };

  // Ensure renderItem properly handles the item
  const renderItem = (image) => {
    return (
      <View style={styles.imageContainer} key={image}> 
        {imageError ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Image not available</Text>
          </View>
        ) : (
          <Image
            source={{ uri: `${image.replace('localhost', '10.0.2.2')}?cache_bust=${new Date().getTime()}` }}
            style={styles.productImage}
            onError={() => {
              setImageError(true);
              console.error(`Error loading image at ${image}`);
            }}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Swiper for Carousel */}
      {images.length > 0 && (
        <Swiper
          style={styles.swiper}
          showsPagination={true}  // Show pagination dots
          autoplay={true}         // Enable autoplay
          loop={true}             // Loop images
          autoplayTimeout={3}     // Set autoplay interval
          dotColor="#FFFFFF"      // Dot color
          activeDotColor="#FF5722" // Active dot color
        >
          {images.map((image) => renderItem(image))}
        </Swiper>
      )}

      <Text style={styles.productName}>{activeVariant.name}</Text>
      <Text style={styles.productPrice}>Price: ${activeVariant.price}</Text>

      {/* Product Description */}
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.productDescription}>
        {activeVariant.product_id.description || "No description available."}
      </Text>

      {/* Display other variants */}
      {otherVariants.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Other Variants</Text>
          {otherVariants.map((variant) => (
            <TouchableOpacity
              key={variant.sku_id} // Use unique SKU ID as key
              style={styles.variantItem}
              onPress={() => handleVariantClick(variant.sku_id)}
            >
              <Image
                source={{ uri: `${variant.image1_url.replace('localhost', '10.0.2.2')}?cache_bust=${new Date().getTime()}` }}
                style={styles.variantImage}
                onError={handleImageError}
              />
              <Text>{variant.name} - ${variant.price}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cartButton} onPress={addToCart}>
          <Text style={styles.cartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Go to Cart Button */}
      <TouchableOpacity
        style={styles.goToCartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <Text style={styles.goToCartButtonText}>Go to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  swiper: {
    height: 320, // Set height for swiper container
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  variantItem: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  variantImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goToCartButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20, // Added space for button separation
  },
  goToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDescriptionPage;

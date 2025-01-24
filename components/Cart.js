import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  // Fetch products in the cart
  const fetchCartItems = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:8080/api/cart');
      setCartItems(response.data); // Set the cart items from the response
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  // Fetch products in the cart when the page loads
  useEffect(() => {
    fetchCartItems();
  }, [cartItems]); // Empty dependency array means it runs only once after the initial render

  // Function to remove items from the cart using the sku_id
  const removeFromCart = async (skuId) => {
    try {
      const response = await axios.patch(`http://10.0.2.2:8080/api/cart/remove/${skuId}`);
      const message = response.data.message;
      console.log(message);

      // If the product was successfully removed, update the state to remove it from the cart
      if (message === 'Product removed from cart.') {
        // Remove the item from the cartItems state directly
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error removing product from cart:', error);
    }
  };

  // Render each cart product
  const renderCartProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image1_url.replace('localhost', '10.0.2.2') }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
      {/* Remove from Cart Button */}
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => removeFromCart(item.sku_id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  // Calculate the total price
  const total = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return total + (isNaN(price) ? 0 : price); // Ensure it's a valid number
  }, 0);

  return (
    <View style={styles.container}>
      {/* Cart Products List */}
      <Text style={styles.sectionTitle}>Your Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.sku_id.toString()}
        renderItem={renderCartProduct}
        contentContainerStyle={styles.productsContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty</Text>}
      />

      {/* Cart Total and Checkout */}
      {cartItems.length > 0 && (
        <View style={styles.cartTotalContainer}>
          <Text style={styles.totalText}>
            Total: ${total.toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingTop: 40, // Add padding to account for the status bar
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#FF5722',
  },
  removeButton: {
    backgroundColor: '#FF5722',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  productsContainer: {
    paddingBottom: 20,
  },
  cartTotalContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: '#FF5722',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Cart;
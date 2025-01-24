import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; // Import the navigation container
import { createStackNavigator } from '@react-navigation/stack'; // Import stack navigator
import Home from './components/Home';
import Cart from './components/Cart';
import ProductDescriptionPage from './components/ProductDescriptionPage';

const Stack = createStackNavigator(); // Create a stack navigator

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TechnoTrove">
        <Stack.Screen name="TechnoTrove" component={Home} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="ProductDescriptionPage" component={ProductDescriptionPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

export default App;

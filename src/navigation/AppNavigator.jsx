import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProductsScreen from "../screens/ProductsScreen";
import UsersScreen from "../screens/UsersScreen";
import LoadingScreen from "../screens/LoadingScreen";
import UnauthorizedScreen from "../screens/UnauthorizedScreen";

/**
 * Simple Navigator - Manages screen state without NavigationContainer
 */
const AppNavigator = () => {
  const { user, loading, isAdmin } = useAuth();
  const [currentScreen, setCurrentScreen] = useState("Home");

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!isAdmin()) {
    return <UnauthorizedScreen />;
  }

  // Navigation object passed to screens
  const navigation = {
    navigate: (screenName) => setCurrentScreen(screenName),
    goBack: () => setCurrentScreen("Home"),
  };

  // Render based on current screen
  switch (currentScreen) {
    case "Orders":
      return <OrdersScreen navigation={navigation} />;
    case "Products":
      return <ProductsScreen navigation={navigation} />;
    case "Users":
      return <UsersScreen navigation={navigation} />;
    default:
      return <HomeScreen navigation={navigation} />;
  }
};

export default AppNavigator;

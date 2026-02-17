import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProductsScreen from "../screens/ProductsScreen";
import UsersScreen from "../screens/UsersScreen";
import LoadingScreen from "../screens/LoadingScreen";
import UnauthorizedScreen from "../screens/UnauthorizedScreen";
import NavigationBar from "../components/ui/NavigationBar";

const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  const { user, loading, isAdmin, logout } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  let screenContent;
  switch (currentScreen) {
    case "Home":
      screenContent = <HomeScreen />;
      break;
    case "Products":
      screenContent = <ProductsScreen />;
      break;
    case "Orders":
      screenContent = <OrdersScreen />;
      break;
    case "Users":
      screenContent = <UsersScreen />;
      break;
    default:
      screenContent = <HomeScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.screenContainer, { paddingTop: insets.top }]}>
        {screenContent}
      </View>
      <NavigationBar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  screenContainer: {
    flex: 1,
  },
});

export default AppNavigator;

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProductsScreen from "../screens/ProductsScreen";
import UsersScreen from "../screens/UsersScreen";
import LoadingScreen from "../screens/LoadingScreen";
import UnauthorizedScreen from "../screens/UnauthorizedScreen";

const Stack = createNativeStackNavigator();

/**
 * AppNavigator - Manages navigation state using React Navigation
 * Handles authentication flow and screen navigation
 */
const AppNavigator = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#F3F4F6" },
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  if (!isAdmin()) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#FEF2F2" },
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureResponseDistance: 50,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Panel Admin",
        }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: "Gestión de Pedidos",
        }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          title: "Gestión de Productos",
        }}
      />
      <Stack.Screen
        name="Users"
        component={UsersScreen}
        options={{
          title: "Gestión de Usuarios",
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

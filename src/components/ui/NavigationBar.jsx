import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, ShoppingBag, Package, Users, LogOut } from "lucide-react-native";
import { useThemeColors } from "../../theme";

const NavigationBar = ({ currentScreen, onNavigate, onLogout }) => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme, insets);

  const navItems = [
    { name: "Home", icon: Home },
    { name: "Products", icon: ShoppingBag },
    { name: "Orders", icon: Package },
    { name: "Users", icon: Users },
    { name: "Logout", icon: LogOut, styles: { color: colorScheme.danger } },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentScreen === item.name;

        return (
          <TouchableOpacity
            key={item.name}
            style={[styles.navItem, isActive]}
            onPress={() => {
              if (item.name === "Logout") {
                onLogout();
              } else {
                onNavigate(item.name);
              }
            }}
          >
            <IconComponent
              size={24}
              color={isActive ? colorScheme.accent : colorScheme.textLight}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colorScheme, insets) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colorScheme.backgroundLight,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12),
      paddingHorizontal: 8,
      justifyContent: "space-around",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
    },
    navItem: {
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default NavigationBar;

/**
 * useFonts Hook
 * Loads custom fonts from Expo Google Fonts
 * Returns a boolean indicating if fonts have been loaded
 */

import * as Font from "expo-font";
import { useEffect, useState } from "react";
import {
  Comfortaa_400Regular,
  Comfortaa_700Bold,
} from "@expo-google-fonts/comfortaa";
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";

export function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Comfortaa: Comfortaa_400Regular,
          Sora: Sora_400Regular,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
        // Set to true anyway so app doesn't get stuck
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return fontsLoaded;
}

export default useFonts;

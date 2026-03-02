/**
 * useFonts Hook
 * Loads custom fonts from Expo Google Fonts
 * Returns a boolean indicating if fonts have been loaded
 */

import * as Font from "expo-font";
import { useEffect, useState } from "react";
import {
  Comfortaa_400Regular,
  Comfortaa_600SemiBold,
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
        // Each weight variant is registered under a unique key.
        // On Android, fontWeight is unreliable with custom fonts — the exact
        // font file must be loaded under the name used in fontFamily styles.
        await Font.loadAsync({
          "Comfortaa-Regular": Comfortaa_400Regular,
          "Comfortaa-SemiBold": Comfortaa_600SemiBold,
          "Comfortaa-Bold": Comfortaa_700Bold,
          "Sora-Regular": Sora_400Regular,
          "Sora-SemiBold": Sora_600SemiBold,
          "Sora-Bold": Sora_700Bold,
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

/**
 * Font Theme Configuration
 *
 * Define font families, weights, and predefined text styles.
 */

// NOTE: On Android, React Native cannot synthesize font weights for custom fonts.
// Each weight variant must be loaded under a unique key and referenced by that
// exact name in fontFamily. Do NOT use fontWeight alongside these custom families.
export const fonts = {
  family: {
    comfortaa: "Comfortaa",
    sora: "Sora",
  },

  weight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  heading: {
    h1: {
      fontFamily: "Comfortaa-Bold",
      fontSize: 32,
    },
    h2: {
      fontFamily: "Comfortaa-Bold",
      fontSize: 28,
    },
    h3: {
      fontFamily: "Comfortaa-SemiBold",
      fontSize: 24,
    },
    h4: {
      fontFamily: "Comfortaa-SemiBold",
      fontSize: 20,
    },
  },

  body: {
    lg: {
      fontFamily: "Sora-Regular",
      fontSize: 16,
    },
    base: {
      fontFamily: "Sora-Regular",
      fontSize: 14,
    },
    sm: {
      fontFamily: "Sora-Regular",
      fontSize: 12,
    },
    xs: {
      fontFamily: "Sora-Regular",
      fontSize: 10,
    },
  },

  button: {
    fontFamily: "Sora-Bold",
    fontSize: 16,
  },
};

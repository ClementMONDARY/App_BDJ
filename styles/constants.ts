// Couleurs de l'application
export const colors = {
  primary: "#257A83",
  secondary: "#666",
  background: "#fff",
  backgroundLight: "#f5f5f5",
  text: "#000",
  textLight: "#666",
  white: "#fff",
  shadow: "#000",
};

// Espacements
export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  xxl: 40,
  xxxl: 50,
  paddingMain: 15,
};

// Polices
export const fonts = {
  // Utilisation temporaire de monospace en attendant l'installation des polices custom
  primary: "monospace",
  primaryBold: "monospace",
  primaryMedium: "monospace",
  // Les vraies polices Roboto Mono (à activer après installation)
  roboto: {
    primary: "RobotoMono_400Regular",
    primaryBold: "RobotoMono_700Bold",
    primaryMedium: "RobotoMono_500Medium",
  },
};

// Tailles de police
export const fontSize = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 24,
  xxlarge: 28,
};

// Rayons de bordure
export const borderRadius = {
  small: 5,
  medium: 10,
  large: 15,
};

// Ombres
export const shadows = {
  light: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
};

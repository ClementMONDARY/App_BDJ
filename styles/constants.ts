// Couleurs de l'application
export const colors = {
  primary: "#257A83",
  primaryDark: "#1A555B",
  iconActive: "#FFFFFF",
  iconInactive: "#929292",
  black: "#1E1E1E",
  white: "#FFF",
  backgroundLight: "#f5f5f5",
  background: "#25292e",
  textDark: "#000",
  textLight: "#FFF",
  inputBorder: "#DDDDDD",
  shadow: "#000",
  error: "#CD0000",
  underline: "#D9D9D9",
};

// Espacements
export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  "2xl": 40,
  xxxl: 50,
  paddingMain: 15,
};

// Polices
export const fonts = {
  // définir la police par défaut sur Roboto Mono (clés chargées via useFonts)
  primary: "RobotoMono_400Regular",
  primaryBold: "RobotoMono_700Bold",
  primaryMedium: "RobotoMono_500Medium",
  // Les vraies polices Roboto Mono (noms répertoriés pour référence)
  roboto: {
    primary: "RobotoMono_400Regular",
    primaryBold: "RobotoMono_700Bold",
    primaryMedium: "RobotoMono_500Medium",
  },
};

// Tailles de police
export const fontSize = {
  xs: 12,
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
};

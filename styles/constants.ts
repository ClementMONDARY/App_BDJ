// Palette de base fournie par l'utilisateur
const palette = {
  white: "#FFFFFF",
  black: "#1E1E1E", // Darkest in both
  greyLight: "#F5F5F5", // Light BG
  greyMedium: "#929292", // Inactive
  greyDark: "#4C4C4C", // Mid in Light
  darkBg: "#202020", // Dark BG
  darkSurface: "#353535", // Lighter in Dark
  darkInput: "#454545", // Slightly lighter than surface for inputs
  primary: "#257A83",
  primaryDark: "#1A555B",
  error: "#CD0000",
  warning: "#E8A302",
};

// Interface pour le typage strict du thème
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  surface: string; // Cards, Inputs, Modals
  card: string; // Specific for card backgrounds
  inputBackground: string; // Specific for text inputs
  text: string;
  textWhite: string;
  textSecondary: string;
  border: string;
  iconActive: string;
  iconInactive: string;
  error: string;
  white: string;
  black: string;
  shadow: string;
}

export const lightColors: ThemeColors = {
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  background: palette.greyLight, // #F5F5F5
  surface: palette.white,
  card: palette.white,
  inputBackground: palette.white,
  text: palette.black, // #1E1E1E
  textWhite: palette.white,
  textSecondary: palette.greyDark, // #4C4C4C
  border: "#DDDDDD",
  iconActive: palette.primary,
  iconInactive: palette.greyMedium,
  error: palette.error,
  white: palette.white,
  black: palette.black,
  shadow: palette.black,
};

export const darkColors: ThemeColors = {
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  background: palette.darkBg, // #202020
  surface: palette.darkSurface, // #353535
  card: palette.darkSurface, // #353535
  inputBackground: palette.darkInput, // #454545
  text: palette.white,
  textWhite: palette.white,
  textSecondary: "#AAAAAA",
  border: palette.darkSurface,
  iconActive: palette.white,
  iconInactive: palette.greyMedium,
  error: "#FF6B6B", // Lighter error for dark mode
  white: palette.white,
  black: "#000000",
  shadow: "#000000",
};

// Backwards compatibility (aliased to light for now)
export const colors = {
  ...lightColors,
  // Mapping old keys to new values for safety
  backgroundLight: lightColors.background,
  textDark: lightColors.text,
  textLight: lightColors.white,
  inputBorder: lightColors.border,
  iconActive: palette.white, // Old code assumed white icon on primary?
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
  "3xl": 50,
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
export const baseFontSize = {
  xss: 9,
  xs: 12,
  s: 14,
  m: 16,
  l: 18,
  xl: 24,
  "2xl": 28,
};

// @deprecated Use fontSizes from useTheme() instead for dynamic sizing
export const fontSize = baseFontSize;

// Rayons de bordure
export const borderRadius = {
  s: 5,
  m: 10,
  l: 15,
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

import { useTheme } from "@/contexts/ThemeContext";
import { StyleSheet } from "react-native";
import {
  baseFontSize,
  borderRadius,
  fonts,
  shadows,
  spacing,
  colors as staticColors, // Renamed to avoid confusion
  type ThemeColors,
} from "./constants";

// Helper type for FontSizes
type FontSizes = typeof baseFontSize;

// Styles communs dynamiques
export const createCommonStyles = (colors: ThemeColors, fontSizes: FontSizes) =>
  StyleSheet.create({
    mainContentContainer: {
      width: "100%",
      height: "100%",
      padding: spacing.md,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      flex: 1,
    },
    // Conteneurs
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },

    containerCentered: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.background,
      padding: spacing.lg,
    },

    containerLight: {
      flex: 1,
      padding: spacing.lg,
    },

    // Textes
    title: {
      fontSize: fontSizes.xl,
      fontWeight: "bold",
      fontFamily: fonts.primaryBold,
      marginBottom: spacing.sm,
      color: colors.text,
    },

    titleLarge: {
      fontSize: fontSizes["2xl"],
      fontWeight: "bold",
      fontFamily: fonts.primaryBold,
      marginBottom: spacing.sm,
      textAlign: "center",
      color: colors.text,
    },

    subtitle: {
      fontSize: fontSizes.m,
      fontFamily: fonts.primary,
      marginBottom: spacing.xl,
      textAlign: "center",
      color: colors.text,
    },

    // Boutons
    button: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.m,
      alignItems: "center",
    },

    buttonText: {
      color: colors.white,
      fontSize: fontSizes.m,
      fontFamily: fonts.primaryMedium,
      fontWeight: "600",
    },

    // Conteneurs spéciaux
    buttonContainer: {
      width: "100%",
      gap: spacing.md,
    },

    // Options/Listes
    option: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.m,
      ...shadows.light,
    },

    optionText: {
      fontSize: fontSizes.m,
      fontFamily: fonts.primaryMedium,
      fontWeight: "500",
      color: colors.text,
    },

    optionContainer: {
      gap: spacing.sm,
    },

    // Boutons spéciaux
    backButton: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.m,
      alignItems: "center",
      marginTop: spacing.xl,
    },

    backButtonText: {
      color: colors.white,
      fontSize: fontSizes.m,
      fontFamily: fonts.primaryMedium,
      fontWeight: "600",
    },
  });

// Styles spécifiques par page dynamiques
export const createPageStyles = (
  colors: ThemeColors,
  fontSizes: FontSizes,
  common: ReturnType<typeof createCommonStyles>,
) => ({
  // Page d'accueil
  home: StyleSheet.create({
    container: {
      ...common.containerCentered,
    },
    title: {
      ...common.titleLarge,
    },
    subtitle: {
      ...common.subtitle,
    },
    buttonContainer: {
      ...common.buttonContainer,
    },
    button: {
      ...common.button,
    },
    buttonText: {
      ...common.buttonText,
    },
  }),

  // Pages login et profile
  auth: StyleSheet.create({
    container: {
      ...common.containerCentered,
    },
    title: {
      ...common.title,
    },
    subtitle: {
      ...common.subtitle,
      marginBottom: spacing.lg,
      textAlign: "left",
    },
  }),

  // Page settings
  settings: StyleSheet.create({
    container: {
      ...common.containerLight,
    },
    title: {
      ...common.title,
      marginTop: spacing["3xl"],
    },
    subtitle: {
      ...common.subtitle,
      textAlign: "left",
      marginBottom: spacing.xl,
    },
    optionContainer: {
      ...common.optionContainer,
    },
    option: {
      ...common.option,
    },
    optionText: {
      ...common.optionText,
    },
    backButton: {
      ...common.backButton,
    },
    backButtonText: {
      ...common.backButtonText,
    },
  }),
});

// Hook pour utiliser les styles globaux dynamiques
export const useGlobalStyles = () => {
  const { colors, fontSizes } = useTheme();
  const common = createCommonStyles(colors, fontSizes);
  const page = createPageStyles(colors, fontSizes, common);
  return { common, page };
};

// @deprecated Use useGlobalStyles() instead
export const commonStyles = createCommonStyles(staticColors, baseFontSize);
// @deprecated Use useGlobalStyles() instead
export const pageStyles = createPageStyles(
  staticColors,
  baseFontSize,
  commonStyles,
);

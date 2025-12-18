import { StyleSheet } from "react-native";
import {
  borderRadius,
  colors,
  fontSize,
  fonts,
  shadows,
  spacing,
} from "./constants";

// Styles communs pour tous les composants
export const commonStyles = StyleSheet.create({
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
    fontSize: fontSize.xlarge,
    fontWeight: "bold",
    fontFamily: fonts.primaryBold,
    marginBottom: spacing.sm,
    color: colors.textDark,
  },

  titleLarge: {
    fontSize: fontSize.xxlarge,
    fontWeight: "bold",
    fontFamily: fonts.primaryBold,
    marginBottom: spacing.sm,
    textAlign: "center",
    color: colors.textDark,
  },

  subtitle: {
    fontSize: fontSize.medium,
    fontFamily: fonts.primary,
    marginBottom: spacing.xl,
    textAlign: "center",
  },

  // Boutons
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: "center",
  },

  buttonText: {
    color: colors.white,
    fontSize: fontSize.medium,
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
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    ...shadows.light,
  },

  optionText: {
    fontSize: fontSize.medium,
    fontFamily: fonts.primaryMedium,
    fontWeight: "500",
    color: colors.textDark,
  },

  optionContainer: {
    gap: spacing.sm,
  },

  // Boutons spéciaux
  backButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: "center",
    marginTop: spacing.xl,
  },

  backButtonText: {
    color: colors.white,
    fontSize: fontSize.medium,
    fontFamily: fonts.primaryMedium,
    fontWeight: "600",
  },
});

// Styles spécifiques par page
export const pageStyles = {
  // Page d'accueil
  home: StyleSheet.create({
    container: {
      ...commonStyles.containerCentered,
    },
    title: {
      ...commonStyles.titleLarge,
    },
    subtitle: {
      ...commonStyles.subtitle,
    },
    buttonContainer: {
      ...commonStyles.buttonContainer,
    },
    button: {
      ...commonStyles.button,
    },
    buttonText: {
      ...commonStyles.buttonText,
    },
  }),

  // Pages login et profile
  auth: StyleSheet.create({
    container: {
      ...commonStyles.containerCentered,
    },
    title: {
      ...commonStyles.title,
    },
    subtitle: {
      ...commonStyles.subtitle,
      marginBottom: spacing.lg,
      textAlign: "left",
    },
  }),

  // Page settings
  settings: StyleSheet.create({
    container: {
      ...commonStyles.containerLight,
    },
    title: {
      ...commonStyles.title,
      marginTop: spacing.xxxl,
    },
    subtitle: {
      ...commonStyles.subtitle,
      textAlign: "left",
      marginBottom: spacing.xl,
    },
    optionContainer: {
      ...commonStyles.optionContainer,
    },
    option: {
      ...commonStyles.option,
    },
    optionText: {
      ...commonStyles.optionText,
    },
    backButton: {
      ...commonStyles.backButton,
    },
    backButtonText: {
      ...commonStyles.backButtonText,
    },
  }),
};

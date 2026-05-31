import { AdminCard } from "@/components/admin/AdminCard";
import { UnderlinedTitle } from "@/components/global/text/UnderlinedTitle";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, type fontSize, spacing, type ThemeColors } from "@/styles";
import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function AdminPage() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const styles = useThemeStyles(createStyles);

  const cardWidth = (width - 2 * spacing.paddingMain - spacing.sm) / 2;

  return (
    <>
      <Stack.Screen options={{ title: "Admin" }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        {/* Header section */}
        <View style={styles.headerSection}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingLabel}>Bonjour</Text>
            <Text style={styles.greetingName}>
              {user?.firstname?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            Bienvenue dans ton espace staff. Choisis ce qu tu veux consulter:
          </Text>
        </View>

        {/* Modules section */}
        <View style={styles.modulesSection}>
          <UnderlinedTitle title="Panneaux d'aministration" />
          <View style={styles.grid}>
            <AdminCard
              iconName="calendar-outline"
              label="Events"
              style={{ width: cardWidth }}
            />
            <AdminCard
              iconName="newspaper-outline"
              label="Articles"
              style={{ width: cardWidth }}
            />
            <AdminCard
              iconName="chatbubble-outline"
              label="Suggestions"
              style={{ width: cardWidth }}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof fontSize) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.paddingMain,
      gap: spacing.md,
      alignItems: "center",
    },
    headerSection: {
      alignSelf: "stretch",
      gap: spacing.sm,
    },
    greetingBlock: {
      alignSelf: "stretch",
      alignItems: "center",
    },
    greetingLabel: {
      alignSelf: "stretch",
      textAlign: "center",
      color: colors.text,
      fontSize: fontSizes.m,
      fontFamily: fonts.primaryBold,
    },
    greetingName: {
      alignSelf: "stretch",
      textAlign: "center",
      color: colors.primary,
      fontSize: 50,
      fontFamily: fonts.primaryBold,
      textDecorationLine: "underline",
    },
    subtitle: {
      color: colors.text,
      fontSize: fontSizes.m,
      fontFamily: fonts.primary,
    },
    modulesSection: {
      alignSelf: "stretch",
      gap: spacing.sm,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
  });

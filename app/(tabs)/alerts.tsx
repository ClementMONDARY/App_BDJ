import { AlertItem } from "@/components/alerts/AlertItem";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fontSize, fonts, spacing, type ThemeColors } from "@/styles";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Alerts() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const router = useRouter();

  const {
    notifications,
    loading,
    error,
    refetch,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  // 1. Not Connected State
  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>
          Connectez-vous pour voir vos notifications.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Loading State (First load)
  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 3. Error State (Optional, but good UX)
  if (error && notifications.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refetch} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 4. Main List
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlertItem
            notification={item}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Aucune notification pour le moment.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: 100, // Space for tab bar
    },
    emptyText: {
      color: colors.iconInactive,
      fontFamily: fonts.primary,
      fontSize: fontSize.m,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    errorText: {
      color: colors.error,
      fontFamily: fonts.primary,
      fontSize: fontSize.m,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 8,
    },
    loginButtonText: {
      color: "#FFFFFF",
      fontFamily: fonts.primaryBold,
      fontSize: fontSize.m,
    },
  });

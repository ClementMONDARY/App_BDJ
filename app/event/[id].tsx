import { EventsAPI, type Event } from "@/api/events";
import { FullscreenImageModal } from "@/components/global/FullscreenImageModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { formatEventDateRange } from "@/services/dateUtils";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  palette,
  spacing,
  type ThemeColors,
} from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Helpers ---

function getPlacesColor(
  current: number,
  max: number | null,
  errorColor: string,
): string {
  if (max === null) return palette.success;
  if (current >= max) return errorColor;
  if ((max - current) / max < 0.5) return palette.warning;
  return palette.success;
}

function isFull(event: Event): boolean {
  return (
    event.max_capacity !== null && event.current_attendees >= event.max_capacity
  );
}

// --- Component ---

export default function EventDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);

  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(createStyles);
  const queryClient = useQueryClient();
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events", "detail", eventId, user?.id ?? null],
    queryFn: () =>
      EventsAPI.fetchEventById(eventId, user ? authenticatedFetch : undefined),
  });

  const registerMutation = useMutation({
    mutationFn: () => EventsAPI.registerToEvent(eventId, authenticatedFetch),
    onSuccess: (registration) => {
      queryClient.invalidateQueries({
        queryKey: ["events", "detail", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      const message =
        registration.status === "waitlist"
          ? "Vous êtes sur liste d'attente pour cet événement."
          : "Vous êtes inscrit à cet événement !";
      Alert.alert("Inscription", message);
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de s'inscrire à cet événement.");
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: () =>
      EventsAPI.unregisterFromEvent(eventId, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", "detail", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      Alert.alert(
        "Désinscription",
        "Vous n'êtes plus inscrit à cet événement.",
      );
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de se désinscrire de cet événement.");
    },
  });

  const handleCta = () => {
    if (!event) return;

    if (event.is_registered) {
      unregisterMutation.mutate();
      return;
    }
    if (isFull(event)) {
      Alert.alert("Complet", "Cet événement est complet.");
      return;
    }
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Connectez-vous pour vous inscrire à un événement.",
      );
      return;
    }
    registerMutation.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Impossible de charger cet événement.
        </Text>
      </View>
    );
  }

  const placesColor = getPlacesColor(
    event.current_attendees,
    event.max_capacity,
    palette.error,
  );
  const placesLabel =
    event.max_capacity !== null
      ? `${event.current_attendees}/${event.max_capacity}`
      : `${event.current_attendees}`;

  const full = isFull(event);
  const ctaLabel = event.is_registered
    ? "Se désinscrire"
    : full
      ? "Complet"
      : "S'inscrire";
  const ctaColor = event.is_registered
    ? palette.success
    : full || !user
      ? colors.iconInactive
      : palette.primary;

  const isMutating = registerMutation.isPending || unregisterMutation.isPending;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: event.title }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cover image */}
        {event.cover_image ? (
          <Pressable onPress={() => setFullscreenUri(event.cover_image)}>
            <Image
              source={{ uri: event.cover_image }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </Pressable>
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            <Ionicons
              name="image-outline"
              size={48}
              color={colors.iconInactive}
            />
          </View>
        )}

        {/* Content card */}
        <View style={styles.card}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.separator} />

          {/* Date + Attendees */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.text} />
              <Text style={styles.metaText}>
                {formatEventDateRange(event.start_time, event.end_time)}
              </Text>
            </View>
            <View style={styles.metaItemCompact}>
              <Ionicons name="people-outline" size={22} color={colors.text} />
              <Text style={[styles.metaText, { color: placesColor }]}>
                {placesLabel}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={20} color={colors.text} />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.description}>{event.description}</Text>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.ctaWrapper,
          { paddingBottom: spacing.md + insets.bottom },
        ]}
      >
        <Pressable
          style={[styles.ctaButton, { backgroundColor: ctaColor }]}
          onPress={handleCta}
          disabled={isMutating}
        >
          {isMutating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          )}
        </Pressable>
      </View>

      <FullscreenImageModal
        uri={fullscreenUri}
        onClose={() => setFullscreenUri(null)}
      />
    </View>
  );
}

// --- Styles ---

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    errorText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.s,
      color: colors.error,
      textAlign: "center",
    },
    scrollContent: {
      paddingBottom: 100,
    },
    coverImage: {
      width: "100%",
      height: 220,
    },
    coverPlaceholder: {
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      padding: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.m,
      gap: spacing.md,
    },
    title: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xl,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    metaItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    metaItemCompact: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    metaText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
      flexShrink: 1,
    },
    description: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.m,
      color: colors.text,
      lineHeight: fontSizes.m * 1.5,
    },
    // Sticky CTA
    ctaWrapper: {
      padding: spacing.md,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    ctaButton: {
      borderRadius: borderRadius.m,
      paddingVertical: spacing.md,
      alignItems: "center",
      justifyContent: "center",
    },
    ctaText: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: "white",
    },
  });

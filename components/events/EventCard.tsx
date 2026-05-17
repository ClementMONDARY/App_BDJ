import { type Event } from "@/api/events";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  palette,
  shadows,
  spacing,
  type ThemeColors,
} from "@/styles";
import { formatDate } from "@/services/dateUtils";
import { FullscreenImageModal } from "@/components/global/FullscreenImageModal";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

// --- Types ---

interface EventCardProps {
  event: Event;
}

type EventStatus = "open" | "registered" | "closed";

function getEventStatus(event: Event): EventStatus {
  if (event.is_registered) return "registered";
  const now = new Date();
  if (event.start_time < now) return "closed";
  if (
    event.max_capacity !== null &&
    event.current_attendees >= event.max_capacity
  )
    return "closed";
  return "open";
}

function getPlacesColor(
  current: number,
  max: number | null,
  errorColor: string,
): string {
  if (max === null) return palette.success;
  if (current >= max) return errorColor;
  const remaining = max - current;
  if (remaining / max < 0.5) return palette.warning;
  return palette.success;
}

// --- Component ---

export function EventCard({ event }: EventCardProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);

  const status = getEventStatus(event);
  const placesColor = getPlacesColor(
    event.current_attendees,
    event.max_capacity,
    colors.error,
  );

  console.log(event.is_registered);

  const ctaBackgroundColor =
    status === "registered"
      ? palette.success
      : status === "closed"
        ? colors.iconInactive
        : colors.primary;

  const placesLabel =
    event.max_capacity !== null
      ? `${event.current_attendees}/${event.max_capacity}`
      : `${event.current_attendees}`;

  return (
    <View style={styles.card}>
      {/* Main section */}
      <View style={styles.mainSection}>
        {event.cover_image ? (
          <Pressable onPress={() => setFullscreenUri(event.cover_image)}>
            <Image
              source={{ uri: event.cover_image }}
              style={styles.image}
              resizeMode="cover"
            />
          </Pressable>
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons
              name="image-outline"
              size={40}
              color={colors.iconInactive}
            />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {event.description}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.text} />
              <Text style={styles.metaText}>
                {formatDate(event.start_time)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={22} color={colors.text} />
              <Text style={[styles.metaText, { color: placesColor }]}>
                {placesLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA */}
      <Pressable
        style={[styles.ctaButton, { backgroundColor: ctaBackgroundColor }]}
      >
        <Ionicons name="arrow-forward" size={20} color="white" />
      </Pressable>

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
    card: {
      flexDirection: "row",
      gap: spacing.xs,
      borderRadius: borderRadius.s,
    },
    mainSection: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: colors.card,
      padding: 7,
      gap: 7,
      alignItems: "flex-start",
      borderRadius: borderRadius.s,
      ...shadows.medium,
    },
    image: {
      width: 118,
      height: 118,
      borderRadius: borderRadius.s,
    },
    imagePlaceholder: {
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      flex: 1,
      padding: 7,
      gap: 5,
      alignSelf: "stretch",
    },
    title: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.text,
    },
    description: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.text,
      lineHeight: fontSizes.xss * 1.5,
    },
    metaRow: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 7,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    metaText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
    },
    ctaButton: {
      width: 45,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius.s,
      shadowColor: colors.shadow,
      ...shadows.medium,
    },
  });

import { EventsAPI, type Event } from "@/api/events";
import { EventCard } from "@/components/events/EventCard";
import { FilterSlider } from "@/components/global/filter/FilterSlider";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { type baseFontSize, fonts, spacing, type ThemeColors } from "@/styles";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

type FilterValue = "popular" | "soon" | "registered" | "all";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "Populaire", value: "popular" },
  { label: "Bientôt", value: "soon" },
  { label: "Inscrits", value: "registered" },
  { label: "Tous", value: "all" },
];

export default function Events() {
  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("popular");

  const {
    data: events,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["events", "list", user?.id ?? null],
    queryFn: () =>
      EventsAPI.fetchEvents(user ? authenticatedFetch : undefined),
  });

  const filteredEvents = useMemo<Event[]>(() => {
    if (!events) return [];

    const now = new Date();
    let result = [...events];

    // 1. Apply filter
    if (activeFilter === "popular") {
      result = result.filter((e) => e.start_time > now);
      result.sort((a, b) => {
        const ratioA = a.max_capacity ? a.current_attendees / a.max_capacity : 0;
        const ratioB = b.max_capacity ? b.current_attendees / b.max_capacity : 0;
        return ratioB - ratioA;
      });
    } else if (activeFilter === "soon") {
      result = result.filter((e) => e.start_time > now);
      result.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
    } else if (activeFilter === "registered") {
      result = result.filter((e) => e.start_time > now && e.is_registered);
    } else if (activeFilter === "all") {
      result.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
    }

    // 2. Apply search on title + description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query),
      );
    }

    return result;
  }, [events, activeFilter, searchQuery]);

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedTextInput
        placeholder="Rechercher un événement..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginBottom: 0 }}
      />
      <FilterSlider
        options={FILTERS.filter(
          (f) => f.value !== "registered" || !!user,
        )}
        selectedOption={activeFilter}
        onSelect={(val) => setActiveFilter(val as FilterValue)}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Impossible de charger les événements.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEvents}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <EventCard event={item} />}
        ListHeaderComponent={renderHeader()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun événement trouvé.</Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    listContent: {
      padding: spacing.sm,
      paddingBottom: 200,
    },
    separator: {
      height: spacing.md,
    },
    centered: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      alignItems: "center",
      paddingTop: spacing.xl,
    },
    emptyText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.s,
      color: colors.iconInactive,
      textAlign: "center",
    },
    errorText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.s,
      color: colors.error,
      textAlign: "center",
    },
  });

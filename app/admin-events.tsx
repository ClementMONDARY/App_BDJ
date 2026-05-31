import { EventsAPI, type Event } from "@/api/events";
import { EventAdminCard } from "@/components/admin/EventAdminCard";
import { FilterSlider } from "@/components/global/filter/FilterSlider";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { type baseFontSize, fonts, spacing, type ThemeColors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FilterValue = "popular" | "soon" | "all";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "Populaire", value: "popular" },
  { label: "Bientôt", value: "soon" },
  { label: "Tous", value: "all" },
];

export default function AdminEventsPage() {
  const { authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const {
    data: events,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["events", "admin"],
    queryFn: () => EventsAPI.fetchEvents(authenticatedFetch),
  });

  const filteredEvents = useMemo<Event[]>(() => {
    if (!events) return [];

    const now = new Date();
    let result = [...events];

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
    } else {
      result.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          String(e.id).includes(query),
      );
    }

    return result;
  }, [events, activeFilter, searchQuery]);

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedTextInput
        placeholder="Rechercher par titre ou ID..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginBottom: 0 }}
      />
      <FilterSlider
        options={FILTERS}
        selectedOption={activeFilter}
        onSelect={(val) => setActiveFilter(val as FilterValue)}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Admin – Événements" }} />
      {isLoading ? (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>
            Impossible de charger les événements.
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            data={filteredEvents}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <EventAdminCard event={item} />}
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
          <TouchableOpacity style={styles.floatingButton} activeOpacity={0.8}>
            <View style={styles.floatingButtonInner}>
              <Ionicons name="add-circle-outline" size={45} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </>
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
      paddingBottom: 150,
    },
    separator: {
      height: spacing.sm,
    },
    centered: {
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
    floatingButton: {
      position: "absolute",
      bottom: 30,
      right: 20,
    },
    floatingButtonInner: {
      backgroundColor: colors.primary,
      borderRadius: 50,
      padding: 5,
      borderWidth: 2,
      borderColor: colors.primaryDark,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 6,
    },
  });

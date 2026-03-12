import { ForumAPI, type Topic } from "@/api/forum";
import { TopicCard } from "@/components/forum/TopicCard";
import { FilterSlider } from "@/components/global/filter/FilterSlider";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, spacing, type baseFontSize, type ThemeColors } from "@/styles";
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

type FilterValue = "popular" | "recent" | "followed";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "Populaire", value: "popular" },
  { label: "Récent", value: "recent" },
  { label: "Suivis", value: "followed" },
];

export default function Forum() {
  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("popular");

  const {
    data: topics,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    // Include user id in key so query re-runs when user logs in/out
    queryKey: ["forum", "topics", user?.id ?? null],
    queryFn: () => ForumAPI.fetchTopics(user ? authenticatedFetch : undefined),
  });

  // Derive filtered + sorted list client-side
  const filteredTopics = useMemo<Topic[]>(() => {
    if (!topics) return [];

    let result = [...topics];

    // 1. Apply filter
    if (activeFilter === "popular") {
      result.sort(
        (a, b) => b.like_count + b.msg_count - (a.like_count + a.msg_count),
      );
    } else if (activeFilter === "recent") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (activeFilter === "followed") {
      result = result.filter((t) => t.is_followed);
    }

    // 2. Apply search (on title + content)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.content?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [topics, activeFilter, searchQuery]);

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedTextInput
        placeholder="Rechercher un topic..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginBottom: 0 }}
      />
      <FilterSlider
        options={FILTERS.filter(
          // Hide "followed" filter if user is not connected
          (f) => f.value !== "followed" || !!user,
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
        <Text style={styles.errorText}>Impossible de charger les topics.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTopics}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TopicCard topic={item} />}
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
            <Text style={styles.emptyText}>Aucun topic trouvé.</Text>
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
      paddingBottom: spacing["2xl"],
    },
    separator: {
      height: spacing.sm,
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

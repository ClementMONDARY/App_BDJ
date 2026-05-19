import { ArticlesAPI, type Article } from "@/api/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { FilterSlider } from "@/components/global/filter/FilterSlider";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
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

type FilterValue = "popular" | "recent";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "Populaire", value: "popular" },
  { label: "Récent", value: "recent" },
];

export default function Articles() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("popular");

  const {
    data: articles,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["articles", "list"],
    queryFn: () => ArticlesAPI.fetchArticles(),
  });

  const filteredArticles = useMemo<(Article | null)[]>(() => {
    if (!articles) return [];

    let result: Article[] = [...articles];

    if (activeFilter === "popular") {
      result.sort(
        (a, b) => b.view_count + b.like_count - (a.view_count + a.like_count),
      );
    } else if (activeFilter === "recent") {
      result.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query),
      );
    }

    const padded: (Article | null)[] = [...result];
    if (padded.length % 2 !== 0) padded.push(null);

    return padded;
  }, [articles, activeFilter, searchQuery]);

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedTextInput
        placeholder="Rechercher un article..."
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
        <Text style={styles.errorText}>
          Impossible de charger les articles.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredArticles}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item, index) => item ? String(item.id) : `placeholder-${index}`}
        renderItem={({ item }) =>
          item ? <ArticleCard article={item} /> : <View style={styles.cardPlaceholder} />
        }
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
            <Text style={styles.emptyText}>Aucun article trouvé.</Text>
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
      padding: spacing.md,
      paddingBottom: 150,
    },
    row: {
      gap: spacing.sm,
    },
    cardPlaceholder: {
      flex: 1,
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

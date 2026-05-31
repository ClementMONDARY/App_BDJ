import { ArticlesAPI, type Article } from "@/api/articles";
import { ArticleAdminCard } from "@/components/admin/ArticleAdminCard";
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

type FilterValue = "popular" | "recent";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "Populaire", value: "popular" },
  { label: "Récent", value: "recent" },
];

export default function AdminArticlesPage() {
  const { authenticatedFetch } = useAuth();
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
    queryKey: ["articles", "admin"],
    queryFn: () => ArticlesAPI.fetchArticles(authenticatedFetch),
  });

  const filteredArticles = useMemo<Article[]>(() => {
    if (!articles) return [];

    let result = [...articles];

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
          String(a.id).includes(query),
      );
    }

    return result;
  }, [articles, activeFilter, searchQuery]);

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
      <Stack.Screen options={{ title: "Admin – Articles" }} />
      {isLoading ? (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>
            Impossible de charger les articles.
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            data={filteredArticles}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ArticleAdminCard article={item} />}
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

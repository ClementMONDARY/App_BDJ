import { ArticlesAPI, type Article } from "@/api/articles";
import { FullscreenImageModal } from "@/components/global/FullscreenImageModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { formatDate } from "@/services/dateUtils";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  spacing,
  type ThemeColors,
} from "@/styles";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
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

export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const queryClient = useQueryClient();
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);

  const articleId = Number(id);
  const queryKey = ["articles", "detail", articleId, user?.id ?? null];

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () =>
      ArticlesAPI.fetchArticleById(
        articleId,
        user ? authenticatedFetch : undefined,
      ),
  });

  const likeMutation = useMutation({
    mutationFn: () => ArticlesAPI.likeArticle(articleId, authenticatedFetch),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Article>(queryKey);
      queryClient.setQueryData<Article>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          is_liked: !old.is_liked,
          like_count: old.is_liked ? old.like_count - 1 : old.like_count + 1,
        };
      });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.prev);
    },
  });

  const handleLike = () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour liker un article.",
      );
      return;
    }
    likeMutation.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Impossible de charger l'article.</Text>
      </View>
    );
  }

  const isLiked = article.is_liked ?? false;
  const coverUri = article.cover_image;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: article.title }} />

      {/* Top section */}
      <View style={styles.topSection}>
        {/* Cover image */}
        {coverUri ? (
          <Pressable onPress={() => setFullscreenUri(coverUri)}>
            <Image
              source={{ uri: coverUri }}
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

        {/* Date + stats row */}
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(article.updated_at)}</Text>

          <View style={styles.stats}>
            {/* Views */}
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={25} color={colors.text} />
              <Text style={styles.statValue}>{article.view_count}</Text>
            </View>

            <View style={styles.dividerVertical} />

            {/* Likes: count on left, icon on right */}
            <Pressable style={styles.statItem} onPress={handleLike}>
              <Text style={styles.statValue}>{article.like_count}</Text>
              <MaterialIcons
                name={isLiked ? "thumb-up" : "thumb-up-off-alt"}
                size={23}
                color={isLiked ? colors.primary : colors.text}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Horizontal divider */}
      <View style={styles.dividerHorizontal} />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.content}>{article.content}</Text>
      </View>

      <FullscreenImageModal
        uri={fullscreenUri}
        onClose={() => setFullscreenUri(null)}
      />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: spacing.md,
      gap: spacing.sm,
      paddingBottom: 100,
    },
    centered: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    topSection: {
      gap: spacing.sm,
    },
    coverImage: {
      width: "100%",
      height: 153,
      borderRadius: borderRadius.s,
    },
    coverPlaceholder: {
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    date: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.iconInactive,
    },
    stats: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    statValue: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
    },
    dividerVertical: {
      width: 1,
      height: 16,
      backgroundColor: colors.border,
    },
    dividerHorizontal: {
      height: 1,
      backgroundColor: colors.border,
    },
    bottomSection: {
      gap: spacing.md,
    },
    title: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xl,
      color: colors.text,
    },
    content: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
      lineHeight: fontSizes.xs * 1.7,
    },
    errorText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.s,
      color: colors.error,
      textAlign: "center",
    },
  });

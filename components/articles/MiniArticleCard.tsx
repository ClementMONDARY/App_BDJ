import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Article } from "@/api/articles";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  shadows,
  type ThemeColors,
} from "@/styles";

interface MiniArticleCardProps {
  article: Article;
}

export function MiniArticleCard({ article }: MiniArticleCardProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/article/${article.id}`)}
      activeOpacity={0.7}
    >
      {article.cover_image ? (
        <Image
          source={{ uri: article.cover_image }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.coverImage, styles.coverPlaceholder]}>
          <Ionicons
            name="image-outline"
            size={20}
            color={colors.iconInactive}
          />
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>
        {article.title}
      </Text>

      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Feather name="eye" size={12} color={colors.text} />
            <Text style={styles.statText}>{article.view_count}</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="thumbs-up" size={12} color={colors.text} />
            <Text style={styles.statText}>{article.like_count}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.text} />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    card: {
      flex: 1,
      padding: 10,
      backgroundColor: colors.card,
      borderRadius: borderRadius.s,
      gap: 10,
      ...shadows.medium,
      shadowColor: colors.shadow,
    },
    coverImage: {
      width: "100%",
      height: 50,
      borderRadius: borderRadius.s,
    },
    coverPlaceholder: {
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xs,
      color: colors.text,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    stats: {
      flexDirection: "row",
      gap: 10,
    },
    stat: {
      alignItems: "center",
      gap: 5,
    },
    statText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.text,
      textAlign: "center",
    },
  });

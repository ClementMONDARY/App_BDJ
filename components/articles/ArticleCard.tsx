import { type Article } from "@/api/articles";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  type ThemeColors,
} from "@/styles";
import { formatDate } from "@/services/dateUtils";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

// --- Types ---

interface ArticleCardProps {
  article: Article;
}

// --- Component ---

export function ArticleCard({ article }: ArticleCardProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.card}>
      {/* Cover image */}
      <View style={styles.imageContainer}>
        {article.cover_image ? (
          <Image
            source={{ uri: article.cover_image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={40} color={colors.iconInactive} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.date}>{formatDate(article.updated_at)}</Text>
        <Text style={styles.preview} numberOfLines={3}>
          {article.content}
        </Text>

        {/* Stats + CTA */}
        <View style={styles.bottomRow}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={18} color={colors.text} />
              <Text style={styles.statValue}>{article.view_count}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="thumbs-up" size={18} color={colors.text} />
              <Text style={styles.statValue}>{article.like_count}</Text>
            </View>
          </View>

          <Pressable style={styles.cta}>
            <Text style={styles.ctaText}>Lire plus</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// --- Styles ---

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: borderRadius.s,
      overflow: "hidden",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    imageContainer: {
      padding: 7,
      backgroundColor: colors.background,
    },
    image: {
      width: "100%",
      height: 118,
      borderRadius: borderRadius.s,
    },
    imagePlaceholder: {
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: 7,
      paddingBottom: 7,
      gap: 3,
    },
    title: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.text,
    },
    date: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.iconInactive,
    },
    preview: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.text,
      lineHeight: fontSizes.xss * 1.6,
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingTop: 7,
      paddingBottom: 7,
    },
    stats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    statItem: {
      alignItems: "center",
      gap: 5,
    },
    statValue: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
      textAlign: "center",
    },
    cta: {
      paddingHorizontal: 7,
      paddingVertical: 5,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.s,
    },
    ctaText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.textWhite,
    },
  });

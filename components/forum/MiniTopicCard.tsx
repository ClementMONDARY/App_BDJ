import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Topic } from "@/api/forum";
import { getAvatarUri, UsersAPI } from "@/api/users";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  shadows,
  type ThemeColors,
} from "@/styles";

interface MiniTopicCardProps {
  topic: Topic;
}

export function MiniTopicCard({ topic }: MiniTopicCardProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  const { data: author } = useQuery({
    queryKey: ["user", topic.author_id],
    queryFn: () => UsersAPI.getUserPublicInfo(String(topic.author_id)),
    enabled: !!topic.author_id,
  });

  const avatarUri = getAvatarUri(author?.avatar ?? null);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/topic/${topic.id}`)}
      activeOpacity={0.7}
    >
      {topic.cover_image ? (
        <Image
          source={{ uri: topic.cover_image }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : null}

      <Text style={styles.title} numberOfLines={2}>
        {topic.title}
      </Text>

      {!topic.cover_image && topic.content ? (
        <Text style={styles.preview} numberOfLines={3}>
          {topic.content}
        </Text>
      ) : null}

      <View style={styles.footer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={colors.iconInactive}
            />
          </View>
        )}

        <View style={styles.counter}>
          <Ionicons name="chatbubble-outline" size={12} color={colors.text} />
          <Text style={styles.counterText}>{topic.msg_count}</Text>
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
    title: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xs,
      color: colors.text,
    },
    preview: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.textSecondary,
      lineHeight: fontSizes.xss * 1.5,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    avatarFallback: {
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    counter: {
      alignItems: "center",
      gap: 2,
    },
    counterText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.text,
      textAlign: "center",
    },
  });

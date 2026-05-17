import type { Post } from "@/api/forum";
import { UsersAPI, getAvatarUri } from "@/api/users";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { type baseFontSize, fonts, type ThemeColors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

// --- Types ---

interface PostItemProps {
  post: Post;
  onReply: (postId: number, authorId: number | null, username?: string) => void;
}

// --- Helpers ---

const AVATAR_SIZE = 40;

function formatPostDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// --- Component ---

export function PostItem({ post, onReply }: PostItemProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  const { data: author } = useQuery({
    queryKey: ["users", post.author_id],
    queryFn: () => UsersAPI.getUserPublicInfo(String(post.author_id)),
    enabled: post.author_id !== null,
  });

  const avatarUri = getAvatarUri(author?.avatar ?? null);

  return (
    <View style={styles.container}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.avatarPlaceholder,
            { backgroundColor: colors.border },
          ]}
        >
          <Ionicons
            name="person-circle-outline"
            size={Math.round(AVATAR_SIZE * 0.5)}
            color={colors.iconInactive}
          />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>{author?.username ?? "..."}</Text>
          <Text style={styles.timestamp}>
            {formatPostDate(post.created_at)}
          </Text>
        </View>
        <Text style={styles.body}>{post.content}</Text>
        <Pressable
          onPress={() => onReply(post.id, post.author_id, author?.username)}
          hitSlop={8}
        >
          <Text style={styles.reply}>Reply</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Styles ---

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      flex: 1,
      gap: 5,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    username: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xs,
      color: colors.text,
    },
    timestamp: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.textSecondary,
    },
    body: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.text,
    },
    reply: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xss,
      color: colors.textSecondary,
      textAlign: "right",
    },
  });

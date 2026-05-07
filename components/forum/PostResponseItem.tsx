import { type Post } from "@/api/forum";
import { getAvatarUri, UsersAPI } from "@/api/users";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, type ThemeColors, type baseFontSize } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

// --- Types ---

interface PostResponseItemProps {
  post: Post;
  onReply: (postId: number) => void;
  parentAuthorId?: number | null;
}

// --- Helpers ---

const AVATAR_SIZE = 30;

function formatPostDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// --- Component ---

export function PostResponseItem({
  post,
  onReply,
  parentAuthorId,
}: PostResponseItemProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  const { data: author } = useQuery({
    queryKey: ["users", post.author_id],
    queryFn: () => UsersAPI.getUserPublicInfo(post.author_id!.toString()),
    enabled: post.author_id !== null,
  });

  const { data: parentAuthor } = useQuery({
    queryKey: ["users", parentAuthorId],
    queryFn: () => UsersAPI.getUserPublicInfo(parentAuthorId!.toString()),
    enabled: parentAuthorId != null,
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
          <Text style={styles.timestamp}>{formatPostDate(post.created_at)}</Text>
        </View>
        <Text style={styles.body}>
          {parentAuthor && (
            <Text style={styles.mention}>@{parentAuthor.username}{" "}</Text>
          )}
          {post.content}
        </Text>
        <Pressable onPress={() => onReply(post.id)} hitSlop={8}>
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
    mention: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xss,
      color: colors.primary,
    },
    reply: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xss,
      color: colors.textSecondary,
      textAlign: "right",
    },
  });

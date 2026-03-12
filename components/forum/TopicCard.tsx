import { ForumAPI, type Topic } from "@/api/forum";
import { Icons } from "@/constants/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  shadows,
  type ThemeColors,
} from "@/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

// --- Types ---

interface TopicCardProps {
  topic: Topic;
}

// --- Avatar helpers ---

const AVATAR_URL = (id: number) =>
  `https://avatar.iran.liara.run/public?username=${id}`;

const CREATOR_SIZE = 30;
const PARTICIPANT_SIZE = 25;
const MAX_AVATARS = 5; // 1 creator + 4 others

// --- Component ---

export function TopicCard({ topic }: TopicCardProps) {
  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const queryClient = useQueryClient();

  // Fetch messagers for this topic
  const { data: messagersData } = useQuery({
    queryKey: ["forum", "topics", topic.id, "messagers"],
    queryFn: () => ForumAPI.fetchTopicMessagers(topic.id),
  });

  const messagerIds = messagersData?.users_ids ?? [];

  // Full unique set: author + messagers (author may already be in messagerIds)
  const allParticipantIds: number[] = Array.from(
    new Set([
      ...(topic.author_id ? [topic.author_id] : []),
      ...messagerIds,
    ]),
  );

  // Build avatar list: creator first, then up to 4 others
  const participantIds = allParticipantIds
    .filter((id) => id !== topic.author_id)
    .slice(0, MAX_AVATARS - 1);
  const avatarIds: number[] = topic.author_id
    ? [topic.author_id, ...participantIds]
    : participantIds;
  const displayedAvatars = avatarIds.slice(0, MAX_AVATARS);
  const totalOverflow = Math.max(0, allParticipantIds.length - MAX_AVATARS);

  const topicsQueryKey = ["forum", "topics", user?.id ?? null];
  const followMutation = useMutation({
    mutationFn: () => ForumAPI.followTopic(topic.id, authenticatedFetch),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: topicsQueryKey });
      const previous = queryClient.getQueryData<Topic[]>(topicsQueryKey);
      queryClient.setQueryData<Topic[]>(topicsQueryKey, (old) =>
        old?.map((t) =>
          t.id === topic.id ? { ...t, is_followed: !t.is_followed } : t,
        ) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(topicsQueryKey, context.previous);
      }
      Alert.alert("Erreur", "Impossible de suivre ce topic.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsQueryKey });
    },
  });

  const handleFollow = () => {
    if (!user) {
      Alert.alert("Connexion requise", "Connectez-vous pour suivre un topic.", [
        { text: "OK" },
      ]);
      return;
    }
    followMutation.mutate();
  };

  return (
    <View style={styles.card}>
      {/* ── TOP ROW ── */}
      <View style={styles.topRow}>
        {/* Cover image */}
        {topic.cover_image ? (
          <Image
            source={{ uri: topic.cover_image }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            {Icons["thumbs-up"](
              { size: 28, color: colors.iconInactive },
              false,
            )}
          </View>
        )}

        {/* Title + preview */}
        <View style={styles.topContent}>
          <Text style={styles.title} numberOfLines={2}>
            {topic.title}
          </Text>
          {topic.content ? (
            <Text style={styles.preview} numberOfLines={3}>
              {topic.content}
            </Text>
          ) : null}
        </View>

        {/* Follow button */}
        <Pressable
          onPress={handleFollow}
          disabled={followMutation.isPending}
          style={styles.followButton}
          hitSlop={8}
        >
          {Icons.heart(
            {
              size: 30,
              // Read directly from topic prop (= cache) — no local state
              color: topic.is_followed ? colors.error : colors.iconInactive,
            },
            topic.is_followed,
          )}
        </Pressable>
      </View>

      {/* ── BOTTOM ROW ── */}
      <View style={styles.bottomRow}>
        {/* Participating avatars */}
        <View style={styles.avatarRow}>
          {displayedAvatars.map((id, index) => {
            const isCreator = index === 0 && id === topic.author_id;
            const size = isCreator ? CREATOR_SIZE : PARTICIPANT_SIZE;
            const role = isCreator ? "creator" : "participant";
            return (
              <Image
                key={`${role}-${id}`}
                source={{ uri: AVATAR_URL(id) }}
                style={[
                  styles.avatar,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    marginLeft: index === 0 ? 0 : -6,
                    zIndex: MAX_AVATARS - index,
                  },
                ]}
              />
            );
          })}
          {totalOverflow > 0 && (
            <Text style={styles.overflowText}>+{totalOverflow}</Text>
          )}
        </View>

        {/* Counters */}
        <View style={styles.counters}>
          {/* Views */}
          <View style={styles.counterItem}>
            {Icons.eye({ size: 18, color: colors.text })}
            <Text style={styles.counterText}>{topic.view_count}</Text>
          </View>
          {/* Likes */}
          <View style={styles.counterItem}>
            {Icons["thumbs-up"]({ size: 18, color: colors.text }, false)}
            <Text style={styles.counterText}>{topic.like_count}</Text>
          </View>
          {/* Messages */}
          <View style={styles.counterItem}>
            {Icons.message({ size: 18, color: colors.text }, false)}
            <Text style={styles.counterText}>{topic.msg_count}</Text>
          </View>
        </View>

        {/* CTA button (Discuss) — no link yet */}
        <Pressable style={styles.ctaButton}>
          {Icons["topic-details"]({ size: 18, color: colors.white })}
        </Pressable>
      </View>
    </View>
  );
}

// --- Styles ---

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.s,
      padding: 7,
      gap: 10,
      justifyContent: "space-between",
      ...shadows.medium,
      shadowColor: colors.shadow,
    },
    // Top row
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    coverImage: {
      width: 74,
      height: 74,
      borderRadius: borderRadius.s,
    },
    coverPlaceholder: {
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    topContent: {
      flex: 1,
      gap: 3,
    },
    title: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.text,
      flexWrap: "wrap",
    },
    preview: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.text,
      lineHeight: fontSizes.xss * 1.5,
    },
    followButton: {
      paddingTop: 2,
    },
    // Bottom row
    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    avatarRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      borderWidth: 1.5,
      borderColor: colors.surface,
    },
    overflowText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.iconInactive,
      marginLeft: 4,
    },
    counters: {
      flexDirection: "row",
      gap: 8,
    },
    counterItem: {
      alignItems: "center",
      gap: 2,
    },
    counterText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
      textAlign: "center",
    },
    ctaButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.medium,
      shadowColor: colors.shadow,
    },
  });

import { ForumAPI, type Topic } from "@/api/forum";
import { getAvatarUri, UsersAPI } from "@/api/users";
import { Icons } from "@/constants/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  borderRadius,
  fonts,
  spacing,
  type ThemeColors,
} from "@/styles";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MAX_AVATARS = 5;

export default function TopicDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topicId = Number(id);
  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const queryClient = useQueryClient();
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);
  const [participantAvatars, setParticipantAvatars] = useState<
    Record<number, string | null>
  >({});

  const {
    data: topic,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["forum", "topic", topicId],
    queryFn: () => ForumAPI.fetchTopicById(topicId, authenticatedFetch),
  });

  const { data: messagersData } = useQuery({
    queryKey: ["forum", "topic", topicId, "messagers"],
    queryFn: () => ForumAPI.fetchTopicMessagers(topicId),
    enabled: !!topic,
  });

  // Avatar stack logic (mirrors TopicCard)
  const messagerIds = messagersData?.users_ids ?? [];
  const allParticipantIds = Array.from(
    new Set([
      ...(topic?.author_id ? [topic.author_id] : []),
      ...messagerIds,
    ]),
  );
  const participantIds = allParticipantIds
    .filter((pid) => pid !== topic?.author_id)
    .slice(0, MAX_AVATARS - 1);
  const avatarIds = topic?.author_id
    ? [topic.author_id, ...participantIds]
    : participantIds;
  const displayedAvatars = avatarIds.slice(0, MAX_AVATARS);
  const totalOverflow = Math.max(0, allParticipantIds.length - MAX_AVATARS);

  useEffect(() => {
    const fetchAvatars = async () => {
      const entries = await Promise.all(
        displayedAvatars.map(async (uid) => {
          try {
            const profile = await UsersAPI.getUserPublicInfo(uid.toString());
            return [uid, profile.avatar] as [number, string | null];
          } catch {
            return [uid, null] as [number, string | null];
          }
        }),
      );
      setParticipantAvatars(Object.fromEntries(entries));
    };
    if (displayedAvatars.length > 0) fetchAvatars();
  }, [displayedAvatars]);

  const topicsListKey = ["forum", "topics", user?.id ?? null];
  const followMutation = useMutation({
    mutationFn: () => ForumAPI.followTopic(topicId, authenticatedFetch),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["forum", "topic", topicId],
      });
      const previous = queryClient.getQueryData<Topic>([
        "forum",
        "topic",
        topicId,
      ]);
      queryClient.setQueryData<Topic>(["forum", "topic", topicId], (old) =>
        old ? { ...old, is_followed: !old.is_followed } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["forum", "topic", topicId], context.previous);
      }
      Alert.alert("Erreur", "Impossible de suivre ce topic.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsListKey });
    },
  });

  const handleFollow = () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Connectez-vous pour suivre un topic.",
        [{ text: "OK" }],
      );
      return;
    }
    followMutation.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.stateText}>Chargement...</Text>
      </View>
    );
  }

  if (isError || !topic) {
    return (
      <View style={styles.centered}>
        <Text style={styles.stateText}>Impossible de charger ce topic.</Text>
      </View>
    );
  }

  const coverImage = topic.cover_image;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: topic.title }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Topic content ── */}
        <View style={styles.topicContent}>
          {/* Title + Follow */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{topic.title}</Text>
            <Pressable
              onPress={handleFollow}
              disabled={followMutation.isPending}
              hitSlop={8}
            >
              {Icons.heart(
                {
                  size: 30,
                  color: topic.is_followed ? colors.error : colors.iconInactive,
                },
                topic.is_followed,
              )}
            </Pressable>
          </View>

          {/* Description */}
          {topic.content ? (
            <Text style={styles.description}>{topic.content}</Text>
          ) : null}

          {/* Cover image */}
          {coverImage ? (
            <Pressable onPress={() => setFullscreenUri(coverImage)}>
              <Image
                source={{ uri: coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            </Pressable>
          ) : null}

          {/* Attachments slider */}
          {topic.attachment_urls && topic.attachment_urls.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attachmentsRow}
            >
              {topic.attachment_urls.map((uri) => (
                <Pressable key={uri} onPress={() => setFullscreenUri(uri)}>
                  <Image
                    source={{ uri }}
                    style={styles.attachmentThumbnail}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {/* Bottom row: avatars + counters */}
          <View style={styles.bottomRow}>
            {/* Avatar stack + overflow */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarRow}>
                {displayedAvatars.map((uid, index) => {
                  const isCreator = index === 0 && uid === topic.author_id;
                  const size = isCreator ? 30 : 25;
                  const imageUri = getAvatarUri(participantAvatars[uid]);
                  if (imageUri) {
                    return (
                      <Image
                        key={uid}
                        source={{ uri: imageUri }}
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
                  }
                  return (
                    <View
                      key={uid}
                      style={[
                        styles.avatar,
                        {
                          width: size,
                          height: size,
                          borderRadius: size / 2,
                          marginLeft: index === 0 ? 0 : -6,
                          zIndex: MAX_AVATARS - index,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="person-circle-outline"
                        size={Math.round(size * 0.5)}
                        color={colors.iconInactive}
                      />
                    </View>
                  );
                })}
              </View>
              {totalOverflow > 0 && (
                <Text style={styles.overflowText}>
                  + {totalOverflow} personnes
                </Text>
              )}
            </View>

            {/* Counters (icon above, number below) */}
            <View style={styles.counters}>
              <View style={styles.counterItem}>
                <Feather name="eye" size={23} color={colors.text} />
                <Text style={styles.counterText}>{topic.view_count}</Text>
              </View>
              <View style={styles.counterItem}>
                <Feather name="thumbs-up" size={23} color={colors.text} />
                <Text style={styles.counterText}>{topic.like_count}</Text>
              </View>
              <View style={styles.counterItem}>
                {Icons.message({ size: 23, color: colors.text }, false)}
                <Text style={styles.counterText}>{topic.msg_count}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Comments section (à implémenter) ── */}
        <View style={styles.commentsSection} />
      </ScrollView>

      {/* Fullscreen image viewer */}
      <Modal
        visible={!!fullscreenUri}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenUri(null)}
      >
        <Pressable
          style={styles.fullscreenOverlay}
          onPress={() => setFullscreenUri(null)}
        >
          {fullscreenUri ? (
            <Image
              source={{ uri: fullscreenUri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    stateText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.m,
      color: colors.textSecondary,
    },
    scrollContent: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    // Topic content block
    topicContent: {
      gap: spacing.sm,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    title: {
      flex: 1,
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.text,
    },
    description: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.text,
    },
    coverImage: {
      width: "100%",
      height: 160,
      borderRadius: borderRadius.s,
    },
    attachmentsRow: {
      gap: spacing.sm,
    },
    attachmentThumbnail: {
      width: 57,
      height: 56,
      borderRadius: borderRadius.s,
    },
    // Bottom row
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    avatarSection: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
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
      flex: 1,
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.textSecondary,
    },
    counters: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 20,
    },
    counterItem: {
      alignItems: "center",
    },
    counterText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.text,
      textAlign: "center",
    },
    // Comments placeholder
    commentsSection: {
      marginTop: spacing.sm,
    },
    // Fullscreen viewer
    fullscreenOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    fullscreenImage: {
      width: "100%",
      height: "100%",
    },
  });

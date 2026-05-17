import { ForumAPI, groupPostsWithResponses, type Topic } from "@/api/forum";
import { PostItem } from "@/components/forum/PostItem";
import { PostResponseItem } from "@/components/forum/PostResponseItem";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
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
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardEvents,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

const MAX_AVATARS = 5;

export default function TopicDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topicId = Number(id);
  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const queryClient = useQueryClient();
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{
    postId: number;
    authorId: number | null;
  } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [participantAvatars, setParticipantAvatars] = useState<
    Record<number, string | null>
  >({});

  // Floating reply bar (TikTok-style):
  // - <KeyboardStickyView> handles positioning above the keyboard frame-perfect
  //   using native WindowInsets (incl. the suggestion strip on Android).
  // - KeyboardEvents.keyboardDidHide listens on the JS thread and clears the
  //   reply state when the keyboard finishes closing — this hides the bar
  //   without relying on worklets / runOnJS.
  const replyInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!replyingTo) return;
    const sub = KeyboardEvents.addListener("keyboardDidHide", () => {
      setReplyingTo(null);
      setReplyText("");
    });
    return () => sub.remove();
  }, [replyingTo]);

  // Auto-focus the floating input when a reply target is set, so the keyboard
  // opens automatically.
  useEffect(() => {
    if (replyingTo) {
      const t = setTimeout(() => replyInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [replyingTo]);

  // Cross button: dismiss the keyboard. The keyboardDidHide listener above
  // will then clear the reply state, keeping a single source of truth.
  const handleCloseReply = () => {
    Keyboard.dismiss();
  };

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

  const { data: postsData } = useQuery({
    queryKey: ["forum", "topic", topicId, "posts"],
    queryFn: () => ForumAPI.getTopicPosts(topicId),
    enabled: !!topic,
  });

  const groupedPosts = groupPostsWithResponses(postsData ?? []);

  const { data: replyTargetAuthor } = useQuery({
    queryKey: ["users", replyingTo?.authorId],
    queryFn: () => UsersAPI.getUserPublicInfo(String(replyingTo?.authorId)),
    enabled: replyingTo?.authorId != null,
  });

  // Avatar stack logic (mirrors TopicCard)
  const messagerIds = messagersData?.users_ids ?? [];
  const allParticipantIds = Array.from(
    new Set([...(topic?.author_id ? [topic.author_id] : []), ...messagerIds]),
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

  const createPostMutation = useMutation({
    mutationFn: (input: { content: string; parent_id?: number }) =>
      ForumAPI.createPost(topicId, input, authenticatedFetch),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["forum", "topic", topicId, "posts"],
      });
      if (variables.parent_id != null) {
        // Reply submission: dismiss keyboard; keyboardDidHide listener clears state.
        Keyboard.dismiss();
      } else {
        setCommentText("");
      }
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible d'envoyer votre message.");
    },
  });

  const handleReply = (
    postId: number,
    authorId: number | null,
    username?: string,
  ) => {
    setReplyingTo({ postId, authorId });
    setReplyText(username ? `@${username} ` : "");
  };

  const handleSubmitComment = () => {
    if (!user) {
      Alert.alert("Connexion requise", "Connectez-vous pour commenter.", [
        { text: "OK" },
      ]);
      return;
    }
    if (!commentText.trim()) return;
    createPostMutation.mutate({ content: commentText.trim() });
  };

  const handleSubmitReply = () => {
    if (!user) {
      Alert.alert("Connexion requise", "Connectez-vous pour répondre.", [
        { text: "OK" },
      ]);
      return;
    }
    if (!replyText.trim() || replyingTo === null) return;
    createPostMutation.mutate({
      content: replyText.trim(),
      parent_id: replyingTo.postId,
    });
  };

  const handleFollow = () => {
    if (!user) {
      Alert.alert("Connexion requise", "Connectez-vous pour suivre un topic.", [
        { text: "OK" },
      ]);
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

        {/* ── Separator ── */}
        <View style={styles.separator} />

        {/* ── Comments section ── */}
        <View style={styles.commentsSection}>
          {/* Main comment input */}
          <View style={styles.commentInputRow}>
            <ThemedTextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder={`Commenter sous "${topic.title}"`}
              containerStyle={{ flex: 1 }}
              returnKeyType="send"
              onSubmitEditing={handleSubmitComment}
            />
            <Pressable
              onPress={handleSubmitComment}
              disabled={createPostMutation.isPending}
              style={styles.sendButton}
            >
              {createPostMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Feather name="send" size={16} color={colors.white} />
              )}
            </Pressable>
          </View>

          {/* Posts */}
          {groupedPosts.map((post) => {
            return (
              <View key={post.id} style={styles.postGroup}>
                <PostItem post={post} onReply={handleReply} />
                {post.responses.length > 0 && (
                  <View style={styles.responsesWrapper}>
                    <Feather
                      name="corner-down-right"
                      size={18}
                      color={colors.iconInactive}
                      style={{ marginTop: 2 }}
                    />
                    <View style={styles.responsesContainer}>
                      {post.responses.map((response) => (
                        <PostResponseItem
                          key={response.id}
                          post={response}
                          onReply={handleReply}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Floating reply bar (TikTok-style) ── */}
      {replyingTo !== null && (
        <KeyboardStickyView style={styles.floatingReplyBar}>
          <View style={styles.replyBanner}>
            <View style={styles.replyBannerAccent} />
            <Text style={styles.replyBannerText}>
              Répondre à{" "}
              <Text style={styles.replyBannerUsername}>
                @{replyTargetAuthor?.username ?? "..."}
              </Text>
            </Text>
            <Pressable onPress={handleCloseReply} hitSlop={8}>
              <Feather name="x" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.floatingReplyInputRow}>
            <ThemedTextInput
              ref={replyInputRef}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Votre réponse..."
              returnKeyType="send"
              onSubmitEditing={handleSubmitReply}
              containerStyle={{ flex: 1 }}
            />
            <Pressable
              onPress={handleSubmitReply}
              disabled={createPostMutation.isPending}
              style={styles.sendButton}
            >
              {createPostMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Feather name="send" size={16} color={colors.white} />
              )}
            </Pressable>
          </View>
        </KeyboardStickyView>
      )}

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
    // Comments section
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    commentsSection: {
      gap: spacing.md,
    },
    commentInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    sendButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    postGroup: {
      gap: spacing.sm,
    },
    responsesWrapper: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      paddingLeft: 50,
    },
    responsesContainer: {
      flex: 1,
      gap: spacing.sm,
    },
    replyBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.s,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      gap: spacing.sm,
    },
    replyBannerAccent: {
      width: 3,
      alignSelf: "stretch",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    replyBannerText: {
      flex: 1,
      fontFamily: fonts.primary,
      fontSize: fontSizes.xss,
      color: colors.textSecondary,
    },
    replyBannerUsername: {
      fontFamily: fonts.primaryBold,
      color: colors.primary,
    },
    // Floating reply bar (TikTok-style). KeyboardStickyView handles vertical
    // positioning above the keyboard automatically.
    floatingReplyBar: {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      gap: spacing.xs,
    },
    floatingReplyInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingBottom: spacing.sm,
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

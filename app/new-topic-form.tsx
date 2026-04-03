import { ForumAPI } from "@/api/forum";
import { getAvatarUri, UsersAPI } from "@/api/users";
import { FormField } from "@/components/form/FormField";
import { FormMultiImageField } from "@/components/form/FormMultiImageField";
import { FormSingleImageField } from "@/components/form/FormSingleImageField";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { Icons } from "@/constants/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { type baseFontSize, fonts, spacing, type ThemeColors } from "@/styles";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

const schema = z.object({
  title: z
    .string()
    .min(1, "Un titre est requis")
    .max(64, "Le titre ne peut pas dépasser 64 caractères"),
  content: z
    .string()
    .min(1, "Un contenu est requis")
    .max(600, "Le contenu ne peut pas dépasser 600 caractères"),
  cover_image: z.string().optional(),
  attachment_urls: z
    .array(z.string())
    .max(10, "Maximum 10 images d'attachment")
    .optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewTopicForm() {
  const { colors } = useTheme();
  const { user, authenticatedFetch } = useAuth();
  const styles = useThemeStyles(createStyles);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<"post" | "images">("post");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      UsersAPI.getUserPublicInfo(user.id.toString())
        .then((info) => setAuthorAvatar(info.avatar))
        .catch(() => {});
    }
  }, [user]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      cover_image: "",
      attachment_urls: [],
    },
  });

  const titleValue = watch("title", "");
  const contentValue = watch("content", "");

  const onSubmit = (data: FormData) => {
    setPendingData(data);
    setPreviewVisible(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;
    setIsSubmitting(true);
    try {
      await ForumAPI.createTopic(
        {
          title: pendingData.title,
          content: pendingData.content,
          cover_image: pendingData.cover_image || undefined,
          attachment_urls: pendingData.attachment_urls,
        },
        authenticatedFetch,
      );
      await queryClient.invalidateQueries({
        queryKey: ["forum", "topics", user?.id ?? null],
      });
      setPreviewVisible(false);
      router.replace({ pathname: "/(tabs)/forum", params: { filter: "recent" } });
    } catch {
      Alert.alert("Erreur", "Impossible de créer le topic.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarUri = getAvatarUri(authorAvatar);

  return (
    <View style={styles.root}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeSection === "post" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveSection("post")}
        >
          <Feather
            name="edit-2"
            size={24}
            color={
              activeSection === "post" ? colors.primary : colors.iconInactive
            }
          />
          <Text
            style={
              activeSection === "post"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Post
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeSection === "images" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveSection("images")}
        >
          <Feather
            name="image"
            size={24}
            color={
              activeSection === "images" ? colors.primary : colors.iconInactive
            }
          />
          <Text
            style={
              activeSection === "images"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Images
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {activeSection === "post" ? (
          <>
            <FormField
              label="Titre"
              counter={{ current: titleValue.length, max: 64 }}
              error={errors.title?.message}
            >
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <ThemedTextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Entrez le titre du topic"
                    maxLength={64}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Contenu"
              counter={{ current: contentValue.length, max: 600 }}
              error={errors.content?.message}
            >
              <Controller
                control={control}
                name="content"
                render={({ field: { onChange, value } }) => (
                  <ThemedTextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Entrez le contenu du topic"
                    multiline
                    numberOfLines={5}
                    maxLength={600}
                  />
                )}
              />
            </FormField>
          </>
        ) : (
          <>
            <Controller
              control={control}
              name="cover_image"
              render={({ field: { onChange, value } }) => (
                <FormSingleImageField
                  label="Image de couverture (optionnel)"
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="attachment_urls"
              render={({ field: { onChange, value } }) => (
                <FormMultiImageField
                  label="Pièces jointes"
                  value={value || []}
                  onChange={onChange}
                  maxImages={10}
                />
              )}
            />
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ThemedButton
          title="Soumettre le topic"
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      {/* Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Aperçu du topic</Text>

            <ScrollView
              style={styles.previewScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.previewCard}>
                {/* Title + Heart */}
                <View style={styles.previewTopRow}>
                  <Text style={styles.previewTitle} numberOfLines={3}>
                    {pendingData?.title}
                  </Text>
                  {Icons.heart({ size: 22, color: colors.iconInactive }, false)}
                </View>

                {/* Content */}
                <Text style={styles.previewContent}>
                  {pendingData?.content}
                </Text>

                {/* Cover image */}
                {pendingData?.cover_image ? (
                  <Image
                    source={{ uri: pendingData.cover_image }}
                    style={styles.previewCoverImage}
                    resizeMode="cover"
                  />
                ) : null}

                {/* Attachments */}
                {pendingData?.attachment_urls &&
                pendingData.attachment_urls.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.attachmentsContent}
                  >
                    {pendingData.attachment_urls.map((uri) => (
                      <Image
                        key={uri}
                        source={{ uri }}
                        style={styles.attachmentThumbnail}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                ) : null}

                {/* Bottom row: avatar + stats */}
                <View style={styles.previewBottomRow}>
                  <View style={styles.avatarRow}>
                    {avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        style={styles.avatar}
                      />
                    ) : (
                      <Ionicons
                        name="person-circle-outline"
                        size={30}
                        color={colors.iconInactive}
                      />
                    )}
                  </View>

                  <View style={styles.counters}>
                    <View style={styles.counterItem}>
                      <Feather name="eye" size={18} color={colors.text} />
                      <Text style={styles.counterText}>0</Text>
                    </View>
                    <View style={styles.counterItem}>
                      <Feather
                        name="thumbs-up"
                        size={18}
                        color={colors.text}
                      />
                      <Text style={styles.counterText}>0</Text>
                    </View>
                    <View style={styles.counterItem}>
                      {Icons.message({ size: 18, color: colors.text }, false)}
                      <Text style={styles.counterText}>0</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPreviewVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <View style={styles.confirmButtonWrapper}>
                <ThemedButton
                  title="Confirmer"
                  onPress={handleConfirm}
                  loading={isSubmitting}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
    },
    root: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: 100,
    },
    tabBar: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    tabButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: spacing.sm,
    },
    tabButtonActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: "bold",
    },
    tabTextInactive: {
      color: colors.iconInactive,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    // Modal
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      maxHeight: "85%",
    },
    modalTitle: {
      fontSize: fontSizes.l,
      fontFamily: fonts.primaryBold,
      color: colors.text,
      marginBottom: spacing.md,
      textAlign: "center",
    },
    previewScroll: {
      flexGrow: 0,
    },
    // Preview card
    previewCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.sm,
      gap: spacing.sm,
    },
    previewTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    previewTitle: {
      flex: 1,
      fontSize: 16,
      fontFamily: fonts.primaryBold,
      color: colors.text,
    },
    previewContent: {
      fontSize: fontSizes.xss,
      fontFamily: fonts.primary,
      color: colors.text,
      lineHeight: fontSizes.xss * 1.5,
    },
    previewCoverImage: {
      width: "100%",
      height: 160,
      borderRadius: 5,
    },
    attachmentsContent: {
      gap: spacing.sm,
    },
    attachmentThumbnail: {
      width: 80,
      height: 80,
      borderRadius: 5,
    },
    previewBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.xs,
    },
    avatarRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    counters: {
      flexDirection: "row",
      gap: spacing.md,
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
    // Modal buttons
    modalButtons: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: fontSizes.m,
      fontFamily: fonts.primaryBold,
      color: colors.text,
    },
    confirmButtonWrapper: {
      flex: 1,
    },
  });

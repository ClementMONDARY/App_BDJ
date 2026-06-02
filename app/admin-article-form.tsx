import { ArticlesAPI, type NewArticle } from "@/api/articles";
import { FormField } from "@/components/form/FormField";
import { FormSingleImageField } from "@/components/form/FormSingleImageField";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { type baseFontSize, fonts, spacing, type ThemeColors } from "@/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  cover_image: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminArticleForm() {
  const { authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const articleId = id ? Number(id) : undefined;
  const isEdit = articleId !== undefined;

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "", cover_image: "" },
  });

  const { data: existingArticle } = useQuery({
    queryKey: ["articles", articleId],
    queryFn: () => ArticlesAPI.fetchArticleById(articleId!, authenticatedFetch),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingArticle) {
      reset({
        title: existingArticle.title,
        content: existingArticle.content,
        cover_image: existingArticle.cover_image ?? "",
      });
    }
  }, [existingArticle, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: NewArticle = {
        title: data.title,
        content: data.content,
        cover_image: data.cover_image || undefined,
      };
      return isEdit
        ? ArticlesAPI.updateArticle(articleId!, payload, authenticatedFetch)
        : ArticlesAPI.createArticle(payload, authenticatedFetch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles", "admin"] });
      setConfirmVisible(false);
      Alert.alert(
        "Succès",
        isEdit ? "Article modifié avec succès." : "Article créé avec succès.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    },
    onError: () => {
      setConfirmVisible(false);
      Alert.alert("Erreur", "Impossible de sauvegarder l'article. Veuillez réessayer.");
    },
  });

  const titleValue = watch("title", "");
  const contentValue = watch("content", "");
  const isFormReady = titleValue.trim().length > 0 && contentValue.trim().length > 0;

  const onSubmit = (data: FormData) => {
    setPendingData(data);
    setConfirmVisible(true);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{ title: isEdit ? "Modifier l'article" : "Nouvel article" }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <FormField
          label="Titre"
          counter={{ current: titleValue.length, max: 200 }}
        >
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Titre de l'article"
                maxLength={200}
              />
            )}
          />
        </FormField>

        <FormField
          label="Contenu"
          counter={{ current: contentValue.length, max: 5000 }}
        >
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Contenu de l'article"
                multiline
                numberOfLines={10}
                maxLength={5000}
              />
            )}
          />
        </FormField>

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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
        <ThemedButton
          title={isEdit ? "Enregistrer les modifications" : "Créer l'article"}
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormReady}
        />
      </View>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEdit ? "Confirmer la modification" : "Confirmer la création"}
            </Text>

            <ScrollView
              style={styles.previewScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.previewCard}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>TITRE</Text>
                  <Text style={styles.previewValue}>{pendingData?.title}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>CONTENU</Text>
                  <Text style={styles.previewValue} numberOfLines={6}>
                    {pendingData?.content}
                  </Text>
                </View>
                {pendingData?.cover_image ? (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>IMAGE</Text>
                    <Image
                      source={{ uri: pendingData.cover_image }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <View style={styles.confirmButtonWrapper}>
                <ThemedButton
                  title="Confirmer"
                  onPress={() => pendingData && mutation.mutate(pendingData)}
                  loading={mutation.isPending}
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
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
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
    previewCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: spacing.md,
      gap: spacing.md,
    },
    previewRow: {
      gap: spacing.xs,
    },
    previewLabel: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.xs,
      color: colors.iconInactive,
    },
    previewValue: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.s,
      color: colors.text,
    },
    previewImage: {
      width: "100%",
      height: 120,
      borderRadius: 6,
      marginTop: spacing.xs,
    },
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

import { FormField } from "@/components/form/FormField";
import { FormImageField } from "@/components/form/FormImageField";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import type { ThemeColors } from "@/styles";
import { spacing } from "@/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, StyleSheet } from "react-native";
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
    .max(5, "Maximum 5 images d'attachment")
    .optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewTopicForm() {
  const styles = useThemeStyles(createStyles);
  const [attachments, setAttachments] = useState<string[]>([]);

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
    data.attachment_urls = attachments;
    Alert.alert("Succès", "Topic créé avec succès !");
    console.log(data);
  };

  const handleAttachmentsChange = (uris: string[]) => {
    const newAttachments = uris.slice(0, 5);
    setAttachments(newAttachments);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FormField
        label={`Titre (${titleValue.length}/64)`}
        error={
          errors.title?.message ||
          (titleValue.length > 64 ? "Titre dépassé." : undefined)
        }
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
        label="Section d'introduction (à implémenter)"
        style={{ marginTop: spacing.sm, paddingVertical: spacing.sm }}
      >
        <ThemedTextInput
          value=""
          onChangeText={() => {}}
          placeholder="Section à développer"
          editable={false}
        />
      </FormField>

      <FormField
        label={`Contenu (${contentValue.length}/600)`}
        error={
          errors.content?.message ||
          (contentValue.length > 600 ? "Contenu dépassé." : undefined)
        }
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

      <FormField label="Image de couverture (optionnel)">
        <Controller
          control={control}
          name="cover_image"
          render={({ field: { onChange, value } }) => (
            <FormImageField
              label=""
              value={value ? [value] : []}
              onChange={(uris) => onChange(uris[0] || "")}
              placeholder="Sélectionner une image de couverture"
              allowsMultiple={false}
            />
          )}
        />
      </FormField>

      <FormField
        label={`Attachement (${attachments.length}/5)`}
        error={
          attachments.length > 5
            ? "Nombre max d'images d'attachment atteint"
            : undefined
        }
      >
        <FormImageField
          label=""
          value={attachments}
          onChange={handleAttachmentsChange}
          placeholder="Sélectionner des images d'attachment"
          allowsMultiple={true}
          maxImages={5}
        />
      </FormField>

      <ThemedButton title="Créer le topic" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: 100, // to avoid content being hidden behind bottom nav
    },
    content: {
      padding: spacing.md,
      paddingBottom: 100,
    },
  });

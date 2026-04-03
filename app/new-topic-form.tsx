import { FormField } from "@/components/form/FormField";
import { FormMultiImageField } from "@/components/form/FormMultiImageField";
import { FormSingleImageField } from "@/components/form/FormSingleImageField";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import type { ThemeColors } from "@/styles";
import { spacing } from "@/styles";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
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
    .max(5, "Maximum 5 images d'attachment")
    .optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewTopicForm() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [activeSection, setActiveSection] = useState<"post" | "images">("post");

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
    Alert.alert("Succès", "Topic créé avec succès !");
    console.log(data);
  };

  return (
    <View style={styles.root}>
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
                  maxImages={5}
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
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
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
  });

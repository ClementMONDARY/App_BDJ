import { SuggestionsAPI, type Suggestion } from "@/api/suggestions";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { UnderlinedTitle } from "@/components/global/text/UnderlinedTitle";
import { SuggestionItem } from "@/components/suggestion-box/SuggestionItem";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fontSize, fonts, spacing, type ThemeColors } from "@/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const suggestionSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
});

type SuggestionFormValues = z.infer<typeof suggestionSchema>;

export default function SuggestionBox() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  const [searchQuery, setSearchQuery] = useState("");
  const { suggestions, loading, refetch } = useSuggestions();
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(
    [],
  );

  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions(suggestions);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = suggestions.filter(
        (s) =>
          s.title.toLowerCase().includes(lowerQuery) ||
          s.content.toLowerCase().includes(lowerQuery),
      );
      setFilteredSuggestions(filtered);
    }
  }, [searchQuery, suggestions]);

  const onSubmit = async (data: SuggestionFormValues) => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour soumettre une idée.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/login") },
        ],
      );
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error("Token manquant");

      await SuggestionsAPI.submitSuggestion(data.title, data.content, token);

      Alert.alert("Succès", "Votre suggestion a été envoyée !");
      reset();
      refetch();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer la suggestion";
      Alert.alert("Erreur", message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ThemedTextInput
        placeholder="Rechercher des mots clés"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <UnderlinedTitle
        title="IDÉES DE LA COMMUNAUTÉ"
        style={{ marginBottom: 20 }}
      />
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <UnderlinedTitle title="UNE IDÉE EN TETE ?" />

      <View style={styles.inputGroup}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <ThemedTextInput
              placeholder="Votre titre..."
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.title && (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <ThemedTextInput
              placeholder="Votre contenu..."
              multiline
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.content && (
          <Text style={styles.errorText}>{errors.content.message}</Text>
        )}
      </View>

      <ThemedButton
        title="Envoyer"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Boîte à idées" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.background }} // Ensure background matches theme
        keyboardVerticalOffset={100}
      >
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SuggestionItem suggestion={item} onVote={refetch} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={renderForm()}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                Aucune suggestion pour le moment.
              </Text>
            ) : (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: 20 }}
              />
            )
          }
        />
        <View style={{ height: 20 }} />
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerContainer: {
      marginBottom: 0,
      gap: 30,
    },
    listContent: {
      padding: spacing.paddingMain,
      backgroundColor: colors.background,
    },
    emptyText: {
      textAlign: "center",
      color: colors.iconInactive,
      fontFamily: fonts.primary,
      marginTop: 20,
      marginBottom: 40,
    },
    formContainer: {
      marginTop: spacing.md,
      gap: 20,
      paddingTop: 10,
    },
    formTitle: {
      fontSize: fontSize.m,
      fontFamily: fonts.primaryBold,
      color: colors.text,
      marginBottom: 5,
    },
    inputGroup: {
      gap: 5,
    },
    errorText: {
      color: colors.error || "red",
      fontSize: 12,
      fontFamily: fonts.primary,
      marginLeft: 5,
    },
  });

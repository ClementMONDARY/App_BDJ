import { type Suggestion, SuggestionsAPI } from "@/api/suggestions";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { UnderlinedTitle } from "@/components/global/text/UnderlinedTitle";
import { SuggestionItem } from "@/components/suggestion-box/SuggestionItem";
import { useAuth } from "@/contexts/AuthContext";
import { useSuggestions } from "@/hooks/useSuggestions";
import { colors, fontSize, fonts, spacing } from "@/styles";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function SuggestionBox() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const { suggestions, loading, refetch } = useSuggestions();
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(
    [],
  );

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
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

    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert("Erreur", "Veuillez remplir le titre et le contenu.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error("Token manquant");

      await SuggestionsAPI.submitSuggestion(newTitle, newContent, token);

      Alert.alert("Succès", "Votre suggestion a été envoyée !");
      setNewTitle("");
      setNewContent("");
      refetch();
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible d'envoyer la suggestion",
      );
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
      <UnderlinedTitle title="IDÉES DE LA COMMUNAUTÉ" style={{ marginBottom: 20 }} />
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <UnderlinedTitle title="UNE IDÉE EN TETE ?" />

      <ThemedTextInput
        placeholder="Votre titre..."
        value={newTitle}
        onChangeText={setNewTitle}
      />

      <ThemedTextInput
        placeholder="Votre contenu..."
        multiline
        value={newContent}
        onChangeText={setNewContent}
      />

      <ThemedButton
        title="Envoyer"
        onPress={handleSubmit}
        loading={submitting}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Boîte à idées" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.backgroundLight }}
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

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 0,
    gap: 30,
  },
  listContent: {
    padding: spacing.paddingMain,
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
    fontSize: fontSize.medium,
    fontFamily: fonts.primaryBold,
    color: colors.black,
    marginBottom: 5,
  },
});

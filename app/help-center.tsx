import { HelpCenterAPI, type Question } from "@/api/helpCenter";
import { QAItem } from "@/components/QAItem";
import { useAuth } from "@/contexts/AuthContext";
import { useHelpCenterQuestions } from "@/hooks/useHelpCenterQuestions";
import {
  borderRadius,
  colors,
  fontSize,
  fonts,
  shadows,
  spacing,
} from "@/styles";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpCenter() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const { questions, loading, refetch } = useHelpCenterQuestions();
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter questions when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredQuestions(questions);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = questions.filter(
        (q) =>
          q.message.toLowerCase().includes(lowerQuery) ||
          q.answer.toLowerCase().includes(lowerQuery),
      );
      setFilteredQuestions(filtered);
    }
  }, [searchQuery, questions]);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour poser une question.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/login") },
        ],
      );
      return;
    }

    if (!newQuestion.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une question.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error("Impossible de récupérer le token");

      await HelpCenterAPI.submitQuestion(newQuestion, token);

      Alert.alert("Succès", "Votre question a été envoyée !");
      setNewQuestion("");
      refetch(); // Refetch questions to show the new one if it's approved/visible immediately
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des mots clés"
          placeholderTextColor={colors.iconInactive}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        Une Question ? C’est ici que ça se passe ↓
      </Text>

      {/* Question Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Votre question..."
          placeholderTextColor={colors.iconInactive}
          multiline
          textAlignVertical="top"
          value={newQuestion}
          onChangeText={setNewQuestion}
        />
      </View>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          { opacity: pressed || submitting ? 0.7 : 1 },
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>Soumettre</Text>
        )}
      </Pressable>

      {/* Spacer for bottom inset */}
      <View style={{ height: 20 }} />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Centre d'aide" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.backgroundLight }}
        keyboardVerticalOffset={100}
      >
        <FlatList
          data={filteredQuestions}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <QAItem question={item.message} answer={item.answer} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={renderForm()}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>Aucune question trouvée.</Text>
            ) : (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: 20 }}
              />
            )
          }
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.paddingMain,
  },
  headerContainer: {
    marginBottom: spacing.xxl,
  },
  searchContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    ...shadows.light,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: "hidden",
  },
  searchInput: {
    padding: 12,
    fontFamily: fonts.primary,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  emptyText: {
    textAlign: "center",
    color: colors.iconInactive,
    fontFamily: fonts.primary,
    marginTop: 20,
    marginBottom: 40,
  },
  // Form Styles
  formContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.backgroundLight,
    gap: 10,
  },
  formTitle: {
    fontSize: fontSize.medium,
    fontFamily: fonts.primaryBold,
    color: colors.black,
    marginBottom: 5,
  },
  inputWrapper: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    ...shadows.light,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: 10,
  },
  textInput: {
    padding: 12,
    fontFamily: fonts.primary,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  textArea: {
    height: 112,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.light,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.medium,
    fontWeight: "600",
  },
});

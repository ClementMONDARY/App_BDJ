import { HelpCenterAPI, type Question } from "@/api/helpCenter";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { QAItem } from "@/components/help-center/QAItem";
import { useAuth } from "@/contexts/AuthContext";
import { useHelpCenterQuestions } from "@/hooks/useHelpCenterQuestions";
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

export default function HelpCenter() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const { questions, loading, refetch } = useHelpCenterQuestions();
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      refetch();
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
      console.error(error);
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
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        Une question ? C’est ici que ça se passe ↓
      </Text>

      <ThemedTextInput
        placeholder="Votre question..."
        multiline
        value={newQuestion}
        onChangeText={setNewQuestion}
        containerStyle={{ marginBottom: 10 }}
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
        <View style={{ height: 20 }} />
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
  emptyText: {
    textAlign: "center",
    color: colors.iconInactive,
    fontFamily: fonts.primary,
    marginTop: 20,
    marginBottom: 40,
  },
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
});

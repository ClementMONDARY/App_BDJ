import { HelpCenterAPI, type Question } from "@/api/helpCenter";
import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { UnderlinedTitle } from "@/components/global/text/UnderlinedTitle";
import { QAItem } from "@/components/help-center/QAItem";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useHelpCenterQuestions } from "@/hooks/useHelpCenterQuestions";
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

const questionSchema = z.object({
  question: z.string().min(1, "La question est requise"),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function HelpCenter() {
  const { user, authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const { questions, loading, refetch } = useHelpCenterQuestions();
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
    },
  });

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

  const onSubmit = async (data: QuestionFormValues) => {
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

    try {
      setSubmitting(true);
      await HelpCenterAPI.submitQuestion(data.question, authenticatedFetch);

      Alert.alert("Succès", "Votre question a été envoyée !");
      reset();
      refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue.";
      Alert.alert("Erreur", message);
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
      <UnderlinedTitle
        title="FOIRE AUX QUESTIONS"
        style={{ marginBottom: 20 }}
      />
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <UnderlinedTitle title="UNE QUESTION ?" />

      <View style={{ gap: 5 }}>
        <Controller
          control={control}
          name="question"
          render={({ field: { onChange, value } }) => (
            <ThemedTextInput
              placeholder="Votre question..."
              multiline
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.question && (
          <Text style={styles.errorText}>{errors.question.message}</Text>
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
      <Stack.Screen options={{ title: "Centre d'aide" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.background }}
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerContainer: {
      marginBottom: 0,
      gap: 30,
    },
    listContent: {
      padding: spacing.paddingMain,
      backgroundColor: colors.background, // Ensure seamless background
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
      backgroundColor: colors.background, // Match page background
      gap: 20,
    },
    formTitle: {
      fontSize: fontSize.m,
      fontFamily: fonts.primaryBold,
      color: colors.text,
      marginBottom: 20,
    },
    errorText: {
      color: colors.error || "red",
      fontSize: 12,
      fontFamily: fonts.primary,
      marginLeft: 5,
    },
  });

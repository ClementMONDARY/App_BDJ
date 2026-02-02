import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, type fontSize, type ThemeColors } from "@/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const signupSchema = z
  .object({
    firstname: z.string().min(1, "Le prénom est requis"),
    lastname: z.string().min(1, "Le nom est requis"),
    username: z.string().min(1, "Le nom d'utilisateur est requis"),
    email: z.string().email("Email invalide").min(1, "L'email est requis"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setLoading(true);
      await signUp(
        data.email,
        data.password,
        data.username,
        data.firstname,
        data.lastname,
      );
      Alert.alert("Succès", "Compte créé avec succès", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue";
      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Text style={styles.title}>Créer un compte</Text>

        <View style={styles.form}>
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalfWidth]}>
              <Text style={styles.label}>Prénom</Text>
              <Controller
                control={control}
                name="firstname"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstname && styles.inputError,
                    ]}
                    placeholder="Votre prénom"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.firstname && (
                <Text style={styles.errorText}>{errors.firstname.message}</Text>
              )}
            </View>
            <View style={[styles.inputGroup, styles.inputHalfWidth]}>
              <Text style={styles.label}>Nom</Text>
              <Controller
                control={control}
                name="lastname"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.lastname && styles.inputError]}
                    placeholder="Votre nom"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.lastname && (
                <Text style={styles.errorText}>{errors.lastname.message}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="Votre nom d'utilisateur"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="none"
                />
              )}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="exemple@email.com"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalfWidth]}>
              <Text style={styles.label}>Mot de passe</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Votre mot de passe"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>
            <View style={[styles.inputGroup, styles.inputHalfWidth]}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="Confirmez"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    secureTextEntry
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed || loading ? 0.7 : 1 },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.link}>Se connecter</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof fontSize) =>
  StyleSheet.create({
    inputRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    inputHalfWidth: {
      width: "48%",
      marginBottom: 0,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: fontSizes["2xl"],
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 40,
      textAlign: "center",
      fontFamily: fonts.primaryBold,
    },
    form: {
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      color: colors.text,
      fontSize: fontSizes.m,
      fontWeight: "500",
      fontFamily: fonts.primary,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      color: colors.text,
      fontSize: fontSizes.m,
      borderWidth: 1,
      borderColor: colors.border,
      fontFamily: fonts.primary,
    },
    inputError: {
      borderColor: colors.error || "red",
    },
    errorText: {
      color: colors.error || "red",
      fontSize: fontSizes.xs,
      fontFamily: fonts.primary,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: colors.white,
      fontSize: fontSizes.m,
      fontWeight: "bold",
      fontFamily: fonts.primaryBold,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: fontSizes.s,
      fontFamily: fonts.primary,
    },
    link: {
      color: colors.text,
      fontSize: fontSizes.s,
      fontWeight: "bold",
      textDecorationLine: "underline",
      fontFamily: fonts.primaryBold,
    },
  });

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, type ThemeColors } from "@/styles";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
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

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignup = async () => {
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !username ||
      !firstname ||
      !lastname
    ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, username, firstname, lastname);
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
              <TextInput
                style={styles.input}
                placeholder="Votre prénom"
                placeholderTextColor={colors.textSecondary}
                value={firstname}
                onChangeText={setFirstname}
              />
            </View>
            <View style={[styles.inputGroup, styles.inputHalfWidth]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                placeholderTextColor={colors.textSecondary}
                value={lastname}
                onChangeText={setLastname}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom d'utilisateur"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalfWidth]}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre mot de passe"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <View style={[styles.inputGroup, styles.inputHalfWidth]}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed || loading ? 0.7 : 1 },
            ]}
            onPress={handleSignup}
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

const createStyles = (colors: ThemeColors) =>
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
      fontSize: 32,
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
      fontSize: 16,
      fontWeight: "500",
      fontFamily: fonts.primary,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      color: colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
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
      fontSize: 16,
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
      fontSize: 14,
      fontFamily: fonts.primary,
    },
    link: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "bold",
      textDecorationLine: "underline",
      fontFamily: fonts.primaryBold,
    },
  });

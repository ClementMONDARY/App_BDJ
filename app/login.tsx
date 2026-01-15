import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, type fontSize, type ThemeColors } from "@/styles";
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // Navigate to home or previous screen
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Échec de la connexion";
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
        <Text style={styles.title}>Connexion</Text>

        <View style={styles.form}>
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

          <View style={styles.inputGroup}>
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

          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed || loading ? 0.7 : 1 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/signup" asChild>
              <Pressable>
                <Text style={styles.link}>S'inscrire</Text>
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
    container: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "center",
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

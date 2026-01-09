import { ThemedButton } from "@/components/global/buttons/ThemedButton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { type ThemeColors } from "@/styles";
import { commonStyles } from "@/styles/globalStyles";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View
      style={[
        commonStyles.mainContentContainer,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={styles.text}>Home</Text>

      <View style={styles.authContainer}>
        {user ? (
          <>
            <Text style={styles.userInfo}>
              Connecté en tant que: {user.email}
            </Text>
            <ThemedButton title="Se déconnecter" onPress={signOut} />
          </>
        ) : (
          <Text style={styles.userInfo}>Non connecté</Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    text: {
      color: colors.text,
      fontSize: 24,
    },
    authContainer: {
      marginTop: 20,
      alignItems: "center",
      gap: 10,
      width: "80%",
    },
    userInfo: {
      color: colors.text,
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 5,
      width: "100%",
      alignItems: "center",
      marginVertical: 5,
    },
    buttonText: {
      color: colors.white,
      fontWeight: "bold",
    },
  });

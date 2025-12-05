import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home</Text>

      <View style={styles.authContainer}>
        {user ? (
          <>
            <Text style={styles.userInfo}>
              Connecté en tant que: {user.email}
            </Text>
            <Pressable onPress={signOut} style={styles.button}>
              <Text style={styles.buttonText}>Se déconnecter</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
  },
  text: {
    color: colors.textDark,
    fontSize: 24,
    marginBottom: 20,
  },
  authContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 10,
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  userInfo: {
    color: colors.textDark,
    marginBottom: 10,
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
    color: colors.textLight,
    fontWeight: "bold",
  },
});

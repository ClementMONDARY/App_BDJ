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
        ) : (
          <>
            <Text style={styles.userInfo}>Non connecté</Text>
            <Link href="/login" asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Se connecter</Text>
              </Pressable>
            </Link>
            <Link href="/signup" asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>S'inscrire</Text>
              </Pressable>
            </Link>
          </>
        )}
      </View>

      <Link href="/settings" style={{ marginTop: 20 }}>
        <Text style={{ color: colors.primary }}>Settings</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.white,
    fontSize: 24,
    marginBottom: 20,
  },
  authContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 10,
    padding: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    width: "80%",
  },
  userInfo: {
    color: colors.white,
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginVertical: 5,
  },
  buttonText: {
    color: colors.black,
    fontWeight: "bold",
  },
});

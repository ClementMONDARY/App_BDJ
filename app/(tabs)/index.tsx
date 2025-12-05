import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles";

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
          <Text style={styles.userInfo}>Non connecté</Text>
        )}
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
  },
  authContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 10,
    width: "80%",
  },
  userInfo: {
    color: colors.textDark,
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

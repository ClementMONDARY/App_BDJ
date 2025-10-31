import { colors } from "@/styles";
import { StyleSheet, Text, View } from "react-native";

export default function Admin() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin</Text>
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
});

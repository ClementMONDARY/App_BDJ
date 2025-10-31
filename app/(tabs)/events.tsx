import { colors } from "@/styles";
import { StyleSheet, Text, View } from "react-native";

export default function Events() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Events</Text>
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

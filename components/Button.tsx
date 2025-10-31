import { colors } from "@/styles";
import { Pressable, StyleSheet, View, Text } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
};

export default function Button({ label, onPress }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    height: 68,
    marginHorizontal: 20,
    alignItems: "center",
    padding: 3,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

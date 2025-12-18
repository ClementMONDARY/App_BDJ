import { colors, fontSize, fonts, spacing } from "@/styles";
import { StyleSheet, Text, View } from "react-native";

interface QAItemProps {
  question: string;
  answer: string;
}

export function QAItem({ question, answer }: QAItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 6,
    gap: 6,
    marginBottom: spacing.xxl,
  },
  question: {
    color: colors.black,
    fontSize: fontSize.medium,
    fontFamily: fonts.primaryBold,
    textAlign: "left",
  },
  answer: {
    color: colors.black,
    fontSize: fontSize.xs,
    fontFamily: fonts.primary,
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});

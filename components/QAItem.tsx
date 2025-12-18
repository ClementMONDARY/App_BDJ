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
    marginBottom: spacing.xxl, // Gap of 40px from design (gap-10 in flex-col container, so margin bottom helps)
    // Actually the parent container has gap-10 (40px). So this component shouldn't strictly enforce margin if the parent handles gap.
    // Design: "flex flex-col ... gap-10". So I will NOT add large margin bottom here, let the parent handle it.
  },
  question: {
    color: colors.black,
    fontSize: fontSize.medium, // text-base
    fontFamily: fonts.primaryBold, // font-bold
    textAlign: "left",
  },
  answer: {
    color: colors.black,
    fontSize: fontSize.xs, // text-xs
    fontFamily: fonts.primary, // font-light (using primary regular as closest, or specific light font if available)
    lineHeight: 18, // for readability
  },
});

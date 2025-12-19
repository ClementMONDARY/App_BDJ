import { borderRadius, colors, fontSize, fonts, shadows } from "@/styles";
import { forwardRef } from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";

interface ThemedTextInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
}

export const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(
  ({ style, containerStyle, ...props }, ref) => {
    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          style={[styles.input, props.multiline && styles.textArea, style]}
          placeholderTextColor={colors.iconInactive}
          {...props}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    ...shadows.light,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: "hidden",
    width: "100%",
  },
  input: {
    padding: 12,
    fontFamily: fonts.primary,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  textArea: {
    minHeight: 112,
    textAlignVertical: "top",
  },
});

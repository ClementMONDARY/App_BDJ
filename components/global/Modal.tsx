import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import type { ThemeColors } from "@/styles/constants";
import type React from "react";
import {
  Modal as RNModal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export type ModalType = "info" | "warning" | "danger";

interface ModalButton {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  type?: ModalType;
  children: React.ReactNode;
  primaryButton: ModalButton;
  secondaryButton?: ModalButton;
}

export function Modal({
  visible,
  onClose,
  title,
  type = "info",
  children,
  primaryButton,
  secondaryButton,
}: ModalProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  let headerColor = colors.primary;
  let primaryBtnColor = colors.primary;

  if (type === "warning") {
    headerColor = "#E8A302";
    primaryBtnColor = "#E8A302";
  } else if (type === "danger") {
    headerColor = colors.error;
    primaryBtnColor = colors.error;
  }

  return (
    <RNModal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.content}>
                <Text style={[styles.title, { color: headerColor }]}>
                  {title}
                </Text>
                <View style={styles.body}>{children}</View>

                <View style={styles.footer}>
                  {secondaryButton && (
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={secondaryButton.onPress}
                    >
                      <Text style={styles.secondaryButtonText}>
                        {secondaryButton.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      {
                        backgroundColor: primaryBtnColor,
                        opacity: primaryButton.disabled ? 0.5 : 1,
                      },
                    ]}
                    onPress={primaryButton.onPress}
                    disabled={primaryButton.disabled || primaryButton.loading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {primaryButton.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: colors.surface,
      borderRadius: 10,
      overflow: "hidden",
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
      textAlign: "center",
      fontFamily: "Roboto Mono",
    },
    body: {
      marginBottom: 20,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: colors.white, // Text on button usually white
      fontWeight: "bold",
      fontSize: 16,
      fontFamily: "Roboto Mono",
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: 16,
      fontFamily: "Roboto Mono",
    },
  });

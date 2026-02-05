import type { Notification } from "@/api/notifications";
import { Icons } from "@/constants/icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  type baseFontSize,
  fonts,
  shadows,
  spacing,
  type ThemeColors,
} from "@/styles";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AlertItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export function AlertItem({
  notification,
  onMarkAsRead,
  onDelete,
}: AlertItemProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.wrapper}>
      {!notification.is_read && <View style={styles.unreadDot} />}
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {Icons.alerts(
              {
                size: 22,
                color: colors.text,
              },
              false,
            )}
            <Text style={styles.title}>{notification.title}</Text>
          </View>
          {!notification.is_read ? (
            <TouchableOpacity
              style={styles.markReadButton}
              onPress={() => onMarkAsRead(notification.id)}
            >
              <Text style={styles.markReadText}>Marquer comme lu</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onDelete(notification.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {Icons.cross({ size: 14, color: colors.text })}
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.content}>{notification.content}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    wrapper: {
      position: "relative",
      marginBottom: spacing.sm,
    },
    unreadDot: {
      position: "absolute",
      zIndex: 10,
      top: -4,
      left: -4,
      width: 11,
      height: 11,
      backgroundColor: "#F00000",
      borderRadius: 9999,
    },
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 5,
      padding: spacing.sm,
      gap: spacing.sm,
      ...shadows.medium,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: "100%",
      gap: spacing.sm,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      flex: 1,
    },
    title: {
      color: colors.text,
      fontSize: fontSizes.xs,
      fontFamily: fonts.primaryBold,
      flexShrink: 1,
    },
    markReadButton: {
      backgroundColor: colors.primary,
      borderRadius: 5,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    markReadText: {
      color: colors.white,
      fontSize: fontSizes.xss,
      fontFamily: fonts.primary,
    },
    content: {
      color: colors.text,
      fontSize: fontSizes.xss,
      fontFamily: fonts.primary,
      lineHeight: 14,
    },
  });

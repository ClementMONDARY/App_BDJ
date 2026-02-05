import type { Notification } from "@/api/notifications";
import { Icons } from "@/constants/icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fonts, type ThemeColors } from "@/styles";
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
            <View style={styles.iconPlaceholder}>
              {Icons.alerts(
                {
                  size: 14,
                  color: colors.text,
                },
                false,
              )}
            </View>
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      position: "relative",
      marginBottom: 10,
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
      padding: 10,
      gap: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      flex: 1, // Allow title to take space
    },
    iconPlaceholder: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 3, // slightly rounded square from mockup look
    },
    title: {
      color: colors.text,
      fontSize: 12,
      fontFamily: fonts.primary,
      fontWeight: "300",
      flexShrink: 1,
    },
    markReadButton: {
      backgroundColor: colors.primary,
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    markReadText: {
      color: colors.white,
      fontSize: 9,
      fontFamily: fonts.primary,
      fontWeight: "300",
    },
    content: {
      color: colors.text,
      fontSize: 9,
      fontFamily: fonts.primary,
      fontWeight: "300",
      lineHeight: 14,
    },
  });

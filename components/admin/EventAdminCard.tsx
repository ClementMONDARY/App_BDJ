import { EventsAPI, type Event } from "@/api/events";
import { Modal } from "@/components/global/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { formatDate } from "@/services/dateUtils";
import { borderRadius, fonts, type baseFontSize, spacing, type ThemeColors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EventAdminCardProps {
  event: Event;
}

export function EventAdminCard({ event }: EventAdminCardProps) {
  const { authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const queryClient = useQueryClient();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => EventsAPI.deleteEvent(event.id, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      setIsDeleteModalVisible(false);
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>#{event.id}</Text>
        <Text style={styles.metaText}>{formatDate(event.created_at)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.iconInactive} />
          <Text style={styles.detailText}>{formatDate(event.start_time)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={14} color={colors.iconInactive} />
          <Text style={styles.detailText}>
            {event.current_attendees}/{event.max_capacity ?? "∞"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={20} color="#E8A302" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => setIsDeleteModalVisible(true)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Supprimer l'événement"
        type="danger"
        primaryButton={{
          label: "Supprimer",
          onPress: () => deleteMutation.mutate(),
          loading: deleteMutation.isPending,
        }}
        secondaryButton={{
          label: "Annuler",
          onPress: () => setIsDeleteModalVisible(false),
        }}
      >
        <Text style={[styles.modalText, { marginBottom: spacing.sm }]}>
          Cette action est irréversible.
        </Text>
        <Text style={styles.modalText}>
          L'événement{" "}
          <Text style={styles.modalTextBold}>«{event.title}»</Text>{" "}
          sera définitivement supprimé.
        </Text>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof baseFontSize) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.s,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    metaText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.xs,
      color: colors.iconInactive,
    },
    title: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.m,
      color: colors.text,
    },
    detailsRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    detailText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.s,
      color: colors.text,
    },
    actionsRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: spacing.sm,
    },
    actionBtn: {
      padding: spacing.xs,
    },
    modalText: {
      fontFamily: fonts.primary,
      fontSize: fontSizes.s,
      color: colors.text,
      textAlign: "center",
    },
    modalTextBold: {
      fontFamily: fonts.primaryBold,
    },
  });

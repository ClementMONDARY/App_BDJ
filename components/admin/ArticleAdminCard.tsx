import { ArticlesAPI, type Article } from "@/api/articles";
import { Modal } from "@/components/global/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { formatDate } from "@/services/dateUtils";
import {
  borderRadius,
  fonts,
  type baseFontSize,
  spacing,
  type ThemeColors,
  palette,
} from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ArticleAdminCardProps {
  article: Article;
}

export function ArticleAdminCard({ article }: ArticleAdminCardProps) {
  const { authenticatedFetch } = useAuth();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => ArticlesAPI.deleteArticle(article.id, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles", "admin"] });
      setIsDeleteModalVisible(false);
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>#{article.id}</Text>
        <Text style={styles.metaText}>{formatDate(article.created_at)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {article.title}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="eye-outline" size={14} color={colors.iconInactive} />
          <Text style={styles.detailText}>{article.view_count}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name="heart-outline"
            size={14}
            color={colors.iconInactive}
          />
          <Text style={styles.detailText}>{article.like_count}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() =>
            router.push({ pathname: "/article/[id]", params: { id: article.id } })
          }
        >
          <Ionicons name="eye-outline" size={20} color={palette.info} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: "/admin-article-form",
              params: { id: article.id },
            })
          }
        >
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
        title="Supprimer l'article"
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
          L'article <Text style={styles.modalTextBold}>«{article.title}»</Text>{" "}
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

import { useThemeStyles } from "@/hooks/useThemeStyles";
import type { ThemeColors } from "@/styles";
import { borderRadius, spacing } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { ReactNode } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FormImageFieldProps {
  label: string;
  value?: string[];
  onChange: (uris: string[]) => void;
  placeholder?: string;
  allowsMultiple?: boolean;
  maxImages?: number;
  children?: ReactNode; // for attachments, to show list
}

export function FormImageField({
  label,
  value,
  onChange,
  placeholder = "Sélectionner une image",
  allowsMultiple = false,
  maxImages = 5,
  children,
}: FormImageFieldProps) {
  const styles = useThemeStyles(createStyles);
  const images = value ?? [];

  const handlePickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Nous avons besoin de l'accès à la galerie pour sélectionner des images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: !allowsMultiple,
        allowsMultipleSelection: allowsMultiple,
        aspect: allowsMultiple ? undefined : [1, 1],
        quality: 1,
        selectionLimit: allowsMultiple ? maxImages : 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        if (allowsMultiple) {
          const newImages = [...images, ...uris].slice(0, maxImages);
          onChange(newImages);
        } else {
          onChange([uris[0]]);
        }
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image.");
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePickImages}>
        <Text style={styles.buttonText}>
          {placeholder} ({allowsMultiple ? `max ${maxImages}` : "1"})
        </Text>
      </TouchableOpacity>
      {images.length > 0 && (
        <View style={styles.previewContainer}>
          {images.map((uri) => (
            <View key={uri} style={styles.previewWrapper}>
              <Image source={{ uri }} style={styles.preview} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  const next = images.filter((img) => img !== uri);
                  onChange(next);
                }}
              >
                <Ionicons name="close-circle" size={22} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {children}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    field: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: spacing.sm,
    },
    button: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.m,
      alignItems: "center",
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "bold",
    },
    previewContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: spacing.sm,
    },
    preview: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.s,
    },
    previewWrapper: {
      position: "relative",
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
    },
    deleteButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 12,
    },
  });

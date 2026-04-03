import { useThemeStyles } from "@/hooks/useThemeStyles";
import type { ThemeColors } from "@/styles";
import { borderRadius, colors, spacing } from "@/styles";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FormSingleImageFieldProps {
  label: string;
  value?: string;
  onChange: (uri: string | "") => void;
}

export function FormSingleImageField({
  label,
  value,
  onChange,
}: FormSingleImageFieldProps) {
  const styles = useThemeStyles(createStyles);

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Nous avons besoin de l'accès à la galerie pour sélectionner une image.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image.");
    }
  };

  const handleRemoveImage = () => {
    onChange("");
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>

      {value ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: value }} style={styles.image} />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleRemoveImage}
          >
            <Feather name="x" size={20} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handlePickImage}
          activeOpacity={0.7}
        >
          <Feather name="plus-circle" size={40} color={colors.iconInactive} />
        </TouchableOpacity>
      )}
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
      fontWeight: "700",
      color: colors.text,
      fontFamily: "Roboto Mono",
      marginBottom: 5,
    },
    addButton: {
      height: 150,
      width: "100%",
      padding: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 7,
      justifyContent: "center",
      alignItems: "center",
    },
    plusIcon: {
      width: 40,
      height: 40,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 0,
    },
    imageContainer: {
      position: "relative",
      height: 150,
      width: "100%",
      borderRadius: 7,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    deleteButton: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: "#222222",
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      marginTop: spacing.sm,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });

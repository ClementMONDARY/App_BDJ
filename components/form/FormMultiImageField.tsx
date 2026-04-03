import { useThemeStyles } from "@/hooks/useThemeStyles";
import { borderRadius, fonts, spacing, type ThemeColors } from "@/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FormMultiImageFieldProps {
  label: string;
  value: string[];
  onChange: (uris: string[]) => void;
  maxImages?: number;
}

export function FormMultiImageField({
  label,
  value,
  onChange,
  maxImages = 5,
}: FormMultiImageFieldProps) {
  const styles = useThemeStyles(createStyles);
  const images = value ?? [];
  const canAddMore = images.length < maxImages;

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
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        const newImages = [...images, ...uris].slice(0, maxImages);
        onChange(newImages);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Erreur", "Impossible de sélectionner les images.");
    }
  };

  const handleRemoveImage = (uri: string) => {
    onChange(images.filter((img) => img !== uri));
  };

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {images.length}/{maxImages}
            </Text>
          </View>
        }
      </View>

      <View style={styles.imagesContainer}>
        {images.map((uri) => (
          <View key={uri} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.thumbnail} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemoveImage(uri)}
            >
              <Feather name="x" size={12} color="black" />
            </TouchableOpacity>
          </View>
        ))}

        {canAddMore && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handlePickImages}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    field: {
      marginBottom: spacing.lg,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      marginBottom: 5,
    },
    label: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      fontFamily: fonts.primaryBold,
    },
    counterBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: colors.border,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    counterText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.text,
      fontFamily: fonts.primary,
    },
    imagesContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginTop: 5,
    },
    imageWrapper: {
      position: "relative",
    },
    thumbnail: {
      width: 100,
      height: 100,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.text,
    },
    deleteButton: {
      position: "absolute",
      top: -12,
      right: -12,
      width: 24,
      height: 24,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.black,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: borderRadius.full,
    },
    addButton: {
      width: 50,
      height: 100,
      padding: 10,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.primaryDark,
      borderRadius: 7,
      justifyContent: "center",
      alignItems: "center",
    },
    plusIcon: {
      width: 24,
      height: 24,
      borderWidth: 3,
      borderColor: colors.white,
      borderRadius: 1,
    },
  });

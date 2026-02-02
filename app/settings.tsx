import { UsersAPI } from "@/api/users";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { Modal } from "@/components/global/Modal";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { CONFIG } from "@/constants/Config";
import { icon } from "@/constants/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fontSize, fonts, type ThemeColors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

// Zod Schemas
const profileSchema = z.object({
  username: z.string().min(1, "Le pseudo est requis"),
  bio: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email("Email invalide").min(1, "L'email est requis"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const deleteAccountSchema = z.object({
  emailConfirmation: z.string().email("Email invalide"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export default function Settings() {
  const { user, signOut, getToken } = useAuth();
  const { colors, setTheme, isDark, textSize, setTextSize } = useTheme();

  const styles = useThemeStyles(createStyles);
  const router = useRouter();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile Form
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { isDirty: isProfileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      bio: "",
      firstname: "",
      lastname: "",
      email: user?.email || "",
    },
  });

  // Password Form
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { isValid: isPasswordValid },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Account Deletion Form
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    control: deleteControl,
    handleSubmit: handleDeleteSubmit,
    watch: watchDelete,
    reset: resetDelete,
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      emailConfirmation: "",
    },
  });
  const deleteEmailValue = watchDelete("emailConfirmation");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tokenVal = await getToken();

        if (tokenVal) {
          const response = await fetch(`${CONFIG.API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${tokenVal}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAvatar(data.avatar);
            resetProfile({
              username: data.username || "",
              bio: data.bio || "",
              firstname: data.firstname || "",
              lastname: data.lastname || "",
              email: data.email || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    if (user) {
      resetProfile({
        username: user.username || "",
        email: user.email || "",
        bio: "",
        firstname: "",
        lastname: "",
      });
      fetchUserData();
    }
  }, [user, getToken, resetProfile]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const token = await getToken();
      if (token) {
        await UsersAPI.updateUser(user.id.toString(), token, {
          username: data.username,
          bio: data.bio,
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
        });

        // Update default values to new values so isDirty resets
        resetProfile(data);

        alert("Profil mis à jour avec succès !");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Erreur lors de la mise à jour du profil");
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!user) return;

    // Additional check if needed, though zod handles it
    if (data.newPassword !== data.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = await getToken();
      if (token) {
        await UsersAPI.updateUser(user.id.toString(), token, {
          password: data.newPassword,
        });
        alert("Mot de passe mis à jour avec succès");
        setIsPasswordModalVisible(false);
        resetPassword();
      }
    } catch (error) {
      console.error("Failed to update password", error);
      alert("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  const handleAvatarPick = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        const token = await getToken();
        if (token) {
          // Optimistic update
          const oldAvatar = avatar;
          setAvatar(result.assets[0].uri);

          try {
            const response = await UsersAPI.uploadAvatar(
              result.assets[0].uri,
              token,
            );
            // Confirm with server url
            setAvatar(response.avatar);
          } catch (error) {
            // Revert on failure
            setAvatar(oldAvatar);
            alert("Erreur lors de la mise à jour de l'avatar");
          }
        }
      }
    } catch (error) {
      console.error("Avatar pick error:", error);
    }
  };

  const onDeleteSubmit = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (token) {
        await UsersAPI.deleteAccount(user.id.toString(), token);
        await signOut();
        router.replace("/login");
      }
    } catch (error) {
      console.error("Failed to delete account", error);
      // Ideally show a toast or alert here
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
    }
  };

  const toggleTheme = (value: boolean) => {
    setTheme(value ? "dark" : "light");
  };

  return (
    <>
      <ScrollView style={styles.contentContainer}>
        {!user ? (
          <View style={styles.notConnectedContainer}>
            <View style={styles.avatarWrapper}>
              <Ionicons
                name="person-circle-outline"
                size={100}
                color={colors.iconInactive}
              />
            </View>
            <Text style={styles.notConnectedText}>
              Vous n'êtes pas connecté.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginButtonText}>SE CONNECTER</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Header Profile Section */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                <TouchableOpacity
                  onPress={handleAvatarPick}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri:
                        avatar ||
                        `https://avatar.iran.liara.run/public?username=${
                          user?.username || "User"
                        }`,
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.statusIndicator}>
                    {icon.camera({ size: 14, color: colors.white }, true)}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Fields Section */}
            <View style={styles.fieldsContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PSEUDO</Text>
                <Controller
                  control={profileControl}
                  name="username"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Votre pseudo"
                    />
                  )}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>BIOGRAPHIE</Text>
                <Controller
                  control={profileControl}
                  name="bio"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Votre biographie"
                      multiline
                      numberOfLines={4}
                      style={{ height: 100 }}
                    />
                  )}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOM</Text>
                <Controller
                  control={profileControl}
                  name="lastname"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Votre nom"
                    />
                  )}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PRÉNOM</Text>
                <Controller
                  control={profileControl}
                  name="firstname"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Votre prénom"
                    />
                  )}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL</Text>
                <Controller
                  control={profileControl}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="votre@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                />
              </View>
              <SettingsItem
                type="action"
                label="Modifier le mot de passe"
                onPress={() => {
                  resetPassword();
                  setIsPasswordModalVisible(true);
                }}
              />

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!isProfileDirty || isUpdating) && styles.saveButtonDisabled,
                ]}
                onPress={handleProfileSubmit(onProfileSubmit)}
                disabled={!isProfileDirty || isUpdating}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdating ? "ENREGISTREMENT..." : "SAUVEGARDER"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Settings Options Section using SettingsItem */}
        <View style={styles.settingsContainer}>
          <SettingsItem
            type="bool"
            icon="moon"
            label="Mode Sombre"
            value={isDark}
            onValueChange={toggleTheme}
          />

          <SettingsItem
            type="select"
            icon="text"
            label="Taille du texte"
            selectedValue={
              textSize === "medium"
                ? "Normal"
                : textSize === "small"
                  ? "Petit"
                  : "Grand"
            }
            onPress={() =>
              setTextSize(
                textSize === "small"
                  ? "medium"
                  : textSize === "medium"
                    ? "large"
                    : "small",
              )
            }
          />

          <View style={styles.divider} />

          <SettingsItem
            type="link"
            icon="help"
            label="Centre d’aide / FAQ"
            href="/help-center"
          />

          <SettingsItem
            type="link"
            icon="lightbulb"
            label="Suggérer une idée"
            href="/suggestion-box"
          />

          {user && (
            <>
              <View style={styles.divider} />

              <SettingsItem
                type="action"
                icon="disconnect"
                label="Se déconnecter"
                isWarning
                onPress={handleLogout}
              />

              <SettingsItem
                type="action"
                icon="trashbin"
                label="Supprimer mon compte"
                isDestructive
                onPress={() => {
                  resetDelete();
                  setIsDeleteModalVisible(true);
                }}
              />
            </>
          )}

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Password Update Modal */}
      <Modal
        visible={isPasswordModalVisible}
        onClose={() => setIsPasswordModalVisible(false)}
        title="Modifier le mot de passe"
        type="info"
        primaryButton={{
          label: "Mettre à jour",
          onPress: handlePasswordSubmit(onPasswordSubmit),
          loading: isUpdatingPassword,
          disabled: !isPasswordValid,
        }}
        secondaryButton={{
          label: "Annuler",
          onPress: () => setIsPasswordModalVisible(false),
        }}
      >
        <View style={{ gap: 15 }}>
          <Controller
            control={passwordControl}
            name="currentPassword"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Mot de passe actuel"
                secureTextEntry
              />
            )}
          />
          <Controller
            control={passwordControl}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Nouveau mot de passe"
                secureTextEntry
              />
            )}
          />
          <Controller
            control={passwordControl}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Confirmer le nouveau mot de passe"
                secureTextEntry
              />
            )}
          />
        </View>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Supprimer le compte"
        type="danger"
        primaryButton={{
          label: "Supprimer",
          onPress: handleDeleteSubmit(onDeleteSubmit),
          disabled: deleteEmailValue !== (user?.email || ""),
          loading: isDeleting,
        }}
        secondaryButton={{
          label: "Annuler",
          onPress: () => setIsDeleteModalVisible(false),
        }}
      >
        <Text
          style={{
            marginBottom: 10,
            textAlign: "center",
            color: colors.text,
          }}
        >
          Cette action est irréversible. Toutes vos données seront perdues.
        </Text>
        <Text
          style={{
            marginBottom: 10,
            textAlign: "center",
            color: colors.text,
            fontWeight: "bold",
          }}
        >
          Veuillez taper votre email "{user?.email}" pour confirmer :
        </Text>
        <Controller
          control={deleteControl}
          name="emailConfirmation"
          render={({ field: { onChange, value } }) => (
            <ThemedTextInput
              value={value}
              onChangeText={onChange}
              placeholder={user?.email || ""}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
      </Modal>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    contentContainer: {
      padding: 12,
      gap: 15,
      backgroundColor: colors.background, // Ensure background is themed
      flex: 1, // Needed for full screen background
    },
    profileHeader: {
      paddingVertical: 12,
      alignItems: "center",
      width: "100%",
    },
    avatarWrapper: {
      justifyContent: "flex-end",
      alignItems: "flex-end",
      position: "relative",
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    statusIndicator: {
      width: 24,
      height: 24,
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.background, // Match background
      alignItems: "center",
      justifyContent: "center",
    },
    fieldsContainer: {
      width: "100%",
      gap: 20,
      marginBottom: 30,
    },
    inputGroup: {
      gap: 5,
      width: "100%",
    },
    label: {
      fontSize: 16,
      fontFamily: "Roboto Mono",
      fontWeight: "700",
      color: colors.text,
      textTransform: "uppercase",
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },
    saveButtonDisabled: {
      backgroundColor: colors.iconInactive,
    },
    saveButtonText: {
      color: colors.white,
      fontWeight: "bold",
      fontSize: 16,
      fontFamily: "Roboto Mono",
    },
    settingsContainer: {
      width: "100%",
      gap: 5,
      marginTop: 10,
    },
    divider: {
      height: 2,
      backgroundColor: colors.border,
      borderRadius: 5,
      width: "100%",
      marginVertical: 10,
    },
    notConnectedContainer: {
      paddingVertical: 30,
      alignItems: "center",
      gap: 20,
    },
    notConnectedText: {
      fontFamily: fonts.primary,
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    loginButtonText: {
      color: colors.white,
      fontFamily: fonts.primaryBold,
      fontSize: fontSize.m,
    },
  });

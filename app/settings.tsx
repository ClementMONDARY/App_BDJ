import { UsersAPI } from "@/api/users";
import { ThemedTextInput } from "@/components/global/inputs/ThemedTextInput";
import { Modal } from "@/components/global/Modal";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { CONFIG } from "@/constants/Config";
import { icon } from "@/constants/icons";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Settings() {
  const { user, signOut, getToken } = useAuth();
  const router = useRouter();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState(user?.username || "");
  const [bio, setBio] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [textSize, setTextSize] = useState("Normal");

  // Account Deletion State
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteEmailConfirmation, setDeleteEmailConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
            setPseudo(data.username || "");
            setEmail(data.email || "");
            setAvatar(data.avatar);
            setBio(data.bio || "");
            setFirstName(data.firstname || "");
            setLastName(data.lastname || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    if (user) {
      setPseudo(user.username || "");
      setEmail(user.email || "");
      fetchUserData();
    }
  }, [user, getToken]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  const handleDeleteAccount = async () => {
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

  return (
    <>
      <ScrollView style={styles.contentContainer}>
        {/* Header Profile Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  avatar ||
                  `https://avatar.iran.liara.run/public?username=${user?.username || "User"}`,
              }}
              style={styles.avatar}
            />
            <View style={styles.statusIndicator}>
              {icon.camera({ size: 14, color: colors.white }, true)}
            </View>
          </View>
        </View>

        {/* Fields Section */}
        <View style={styles.fieldsContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PSEUDO</Text>
            <ThemedTextInput
              value={pseudo}
              onChangeText={setPseudo}
              placeholder="Votre pseudo"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>BIOGRAPHIE</Text>
            <ThemedTextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Votre biographie"
              multiline
              numberOfLines={4}
              style={{ height: 100 }}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOM</Text>
            <ThemedTextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Votre nom"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PRÉNOM</Text>
            <ThemedTextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Votre prénom"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <ThemedTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>MOT DE PASSE</Text>
            <ThemedTextInput
              value="*************"
              editable={false}
              placeholder="*************"
            />
          </View>
        </View>

        {/* Settings Options Section using SettingsItem */}
        <View style={styles.settingsContainer}>
          <SettingsItem
            type="bool"
            icon="moon"
            label="Mode Sombre"
            value={isDarkMode}
            onValueChange={setIsDarkMode}
          />

          <SettingsItem
            type="select"
            icon="text"
            label="Taille du texte"
            selectedValue={textSize}
            onPress={() =>
              setTextSize(textSize === "Normal" ? "Large" : "Normal")
            } // Mock logic
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
              setDeleteEmailConfirmation("");
              setIsDeleteModalVisible(true);
            }}
          />

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Supprimer le compte"
        type="danger"
        primaryButton={{
          label: "Supprimer",
          onPress: handleDeleteAccount,
          disabled: deleteEmailConfirmation !== email,
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
            color: colors.textDark,
          }}
        >
          Cette action est irréversible. Toutes vos données seront perdues.
        </Text>
        <Text
          style={{
            marginBottom: 10,
            textAlign: "center",
            color: colors.textDark,
            fontWeight: "bold",
          }}
        >
          Veuillez taper votre email "{email}" pour confirmer :
        </Text>
        <ThemedTextInput
          value={deleteEmailConfirmation}
          onChangeText={setDeleteEmailConfirmation}
          placeholder={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 12,
    gap: 15,
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
    backgroundColor: colors.primary, // Using primary color from tokens
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.backgroundLight,
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
    color: colors.black,
    textTransform: "uppercase",
  },
  settingsContainer: {
    width: "100%",
    gap: 5, // Reduced gap as items have padding
    marginTop: 10,
  },
  divider: {
    height: 2,
    backgroundColor: "#D9D9D9",
    borderRadius: 5,
    width: "100%",
    marginVertical: 10,
  },
});

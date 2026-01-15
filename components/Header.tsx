import { UsersAPI } from "@/api/users";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { fonts } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header(props: any) {
  const { colors } = useTheme();
  const { navigation, route, options, back } = props;
  const title = options?.title ?? (route?.name ? String(route.name) : "Titre");
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      UsersAPI.getUserPublicInfo(user.id.toString())
        .then((info) => setAvatar(info.avatar))
        .catch(() => {});
    } else {
      setAvatar(null);
    }
  }, [user]);

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          height: 60 + insets.top,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: insets.top,
          backgroundColor: colors.black,
          borderBottomRightRadius: 5,
          borderBottomLeftRadius: 5,
          borderBottomColor: colors.border,
          borderBottomWidth: 2,
        }}
      >
        {/* Left: Back Button or Empty View */}
        <View style={{ width: 40, alignItems: "flex-start" }}>
          {back ? (
            <Pressable
              onPress={() => navigation?.goBack?.()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 4,
              })}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.iconInactive}
              />
            </Pressable>
          ) : (
            <Image
              source={require("../assets/images/app-icon_light.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Center: Title */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.textWhite,
              textAlign: "center",
              fontFamily: fonts.primaryBold,
            }}
          >
            {title}
          </Text>
        </View>

        {/* Right: Account and Settings Buttons */}
        <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
          {/* Account Button */}
          {user ? (
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              onPress={() => {
                // Optional: Navigate to profile
              }}
            >
              <Image
                source={{
                  uri:
                    avatar ||
                    `https://avatar.iran.liara.run/public?username=${user.username || user.id}`,
                }}
                style={{ width: 45, height: 45, borderRadius: 22.5 }}
              />
            </Pressable>
          ) : (
            <Link href="/login" asChild>
              <Pressable
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={45}
                  color={colors.iconInactive}
                />
              </Pressable>
            </Link>
          )}

          {/* Settings Button */}
          <Link
            href="/settings"
            style={{
              padding: 4,
            }}
          >
            <Ionicons
              name="settings-outline"
              size={35}
              color={colors.iconInactive}
            />
          </Link>
        </View>
      </View>
    </View>
  );
}

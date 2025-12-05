import { colors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header(props: any) {
  const { navigation, route, options, back } = props;
  const title = options?.title ?? (route?.name ? String(route.name) : "Titre");
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        height: 60 + insets.top,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: insets.top,
        backgroundColor: colors.black,
        borderBottomWidth: 0,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
      }}
    >
      {/* Left: Back Button or Empty View */}
      <View style={{ width: 40, alignItems: "flex-start" }}>
        {back && (
          <Pressable
            onPress={() => navigation?.goBack?.()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              padding: 4,
            })}
          >
            <Ionicons name="arrow-back" size={24} color={colors.iconInactive} />
          </Pressable>
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
            color: colors.iconActive,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      </View>

      {/* Right: Account and Settings Buttons */}
      <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
        {/* Account Button */}
        {/* <Link href="/signup" asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>S'inscrire</Text>
              </Pressable>
            </Link> */}
        <Link href="/login" asChild>
          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Image
              source={{ uri: "https://avatar.iran.liara.run/public" }}
              style={{ width: 45, height: 45, borderRadius: 20 }}
            />
          </Pressable>
        </Link>

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
  );
}

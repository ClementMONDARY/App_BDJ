import { useGlobalStyles } from "@/styles/globalStyles";
import { Text, View } from "react-native";

export default function Profile() {
  const { page } = useGlobalStyles();
  return (
    <View style={page.auth.container}>
      <Text style={page.auth.title}>Mon Profil</Text>
      <Text style={page.auth.subtitle}>
        Gérez vos informations personnelles
      </Text>
    </View>
  );
}

import { Text, View } from "react-native";
import { pageStyles } from "../styles";

export default function Profile() {
  return (
    <View style={pageStyles.auth.container}>
      <Text style={pageStyles.auth.title}>Mon Profil</Text>
      <Text style={pageStyles.auth.subtitle}>
        Gérez vos informations personnelles
      </Text>
    </View>
  );
}

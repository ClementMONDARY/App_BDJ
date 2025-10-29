import { Text, View } from "react-native";
import { pageStyles } from "../styles";

export default function Login() {
  return (
    <View style={pageStyles.auth.container}>
      <Text style={pageStyles.auth.title}>Page de Connexion</Text>
      <Text style={pageStyles.auth.subtitle}>
        Connectez-vous à votre compte
      </Text>
    </View>
  );
}

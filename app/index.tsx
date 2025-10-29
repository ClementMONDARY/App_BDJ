import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { pageStyles } from "../styles";

export default function Index() {
  return (
    <View style={pageStyles.home.container}>
      <Text style={pageStyles.home.title}>Bienvenue dans votre App</Text>
      <Text style={pageStyles.home.subtitle}>
        Votre projet React Native avec Expo
      </Text>

      <View style={pageStyles.home.buttonContainer}>
        <Link href="/login" asChild>
          <TouchableOpacity style={pageStyles.home.button}>
            <Text style={pageStyles.home.buttonText}>Se connecter</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/profile" asChild>
          <TouchableOpacity style={pageStyles.home.button}>
            <Text style={pageStyles.home.buttonText}>Mon Profil</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings" asChild>
          <TouchableOpacity style={pageStyles.home.button}>
            <Text style={pageStyles.home.buttonText}>Paramètres</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

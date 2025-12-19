import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { pageStyles } from "../styles";

export default function Settings() {
  return (
    <View style={pageStyles.settings.container}>
      <Text style={pageStyles.settings.title}>Paramètres</Text>
      <Text style={pageStyles.settings.subtitle}>
        Configurez votre application
      </Text>

      <View style={pageStyles.settings.optionContainer}>
        <TouchableOpacity style={pageStyles.settings.option}>
          <Text style={pageStyles.settings.optionText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={pageStyles.settings.option}>
          <Text style={pageStyles.settings.optionText}>Confidentialité</Text>
        </TouchableOpacity>

        <TouchableOpacity style={pageStyles.settings.option}>
          <Text style={pageStyles.settings.optionText}>À propos</Text>
        </TouchableOpacity>

        <Link href="/suggestion-box" asChild>
          <TouchableOpacity style={pageStyles.settings.option}>
            <Text style={pageStyles.settings.optionText}>
              Boîte de suggestion
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Link href="/" asChild>
        <TouchableOpacity style={pageStyles.settings.backButton}>
          <Text style={pageStyles.settings.backButtonText}>
            Retour à l'accueil
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

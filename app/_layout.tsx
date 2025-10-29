import { Stack } from "expo-router";

export default function RootLayoutWithCustomHeader() {
  return (
    <Stack
      screenOptions={{
        // Option 1: Masquer complètement la barre
        // headerShown: false,

        // Option 2: Personnaliser la barre
        headerStyle: {
          backgroundColor: "#257A83", // Couleur de fond
        },
        headerTintColor: "#fff", // Couleur du texte
        headerTitleStyle: {
          fontFamily: "monospace", // Police personnalisée
          fontWeight: "bold",
        },
        // headerTitle: 'Mon App', // Titre personnalisé pour toutes les pages
      }}
    >
      {/* Configuration spécifique par page */}
      <Stack.Screen
        name="index"
        options={{
          title: "Accueil",
          // headerShown: false, // Pour masquer seulement sur cette page
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Connexion",
          headerBackTitle: "Retour", // Texte du bouton retour
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profil",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Paramètres",
        }}
      />
    </Stack>
  );
}

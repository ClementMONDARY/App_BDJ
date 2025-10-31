import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{
            title: "Accueil",
            headerLeft: () => null,
          }}
        />
        <Stack.Screen name="about" options={{ title: "À propos" }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

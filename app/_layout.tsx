import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  RobotoMono_400Regular,
  RobotoMono_500Medium,
  RobotoMono_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto-mono";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    RobotoMono_400Regular,
    RobotoMono_500Medium,
    RobotoMono_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    if ((Text as any).defaultProps == null) {
      (Text as any).defaultProps = {};
    }
    const existingStyle = (Text as any).defaultProps.style;
    (Text as any).defaultProps.style = [
      existingStyle,
      { fontFamily: "RobotoMono_400Regular" },
    ];
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            header: (props) => <Header {...props} />,
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

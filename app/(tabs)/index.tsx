import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { pageStyles } from "../../styles";

const placeholderImage = "https://picsum.photos/320/440";

export default function Home() {
  return (
    <View style={pageStyles.home.container}>
      <Image source={{ uri: placeholderImage }} style={styles.image} />
      <Text style={pageStyles.home.title}>Bienvenue sur l'application du BDJ !</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  }
});
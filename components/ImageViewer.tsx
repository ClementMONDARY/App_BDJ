import { Image } from "expo-image";
import { StyleSheet } from "react-native";

type Props = {
  imgSrc: string;
};

export default function ImageViewer({ imgSrc }: Props) {
  return <Image source={imgSrc} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    width: "80%",
    height: 340,
    borderRadius: 18,
  },
});

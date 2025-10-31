import { Image } from "expo-image";
import { View } from "react-native";

type Props = {
  imageSize: number;
  StickerSrc: string;
};

export default function EmojiSticker({ imageSize, StickerSrc }: Props) {
  return (
    <View style={{ top: -300 }}>
      <Image
        source={{ uri: StickerSrc }}
        style={{ width: imageSize, height: imageSize }}
      />
    </View>
  );
}

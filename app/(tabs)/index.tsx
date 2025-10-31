import Button from "@/components/Button";
import CircleButton from "@/components/CircleButton";
import EmojiList from "@/components/EmojiList";
import EmojiPicker from "@/components/EmojiPicker";
import IconButton from "@/components/IconButton";
import ImageViewer from "@/components/ImageViewer";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { pageStyles } from "../../styles";
import EmojiSticker from "@/components/EmojiSticker";

const placeholderImage = "https://picsum.photos/320/440";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );
  const [pickedEmoji, setPickedEmoji] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert("You did not select any image.");
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = () => {
    // later
  };

  return (
    <View style={pageStyles.home.container}>
      <ImageViewer imgSrc={selectedImage || placeholderImage} />
      {pickedEmoji && <EmojiSticker imageSize={60} StickerSrc={pickedEmoji} />}
      <Text style={pageStyles.home.title}>
        Bienvenue sur l'application du BDJ !
      </Text>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <IconButton
              icon="save-alt"
              label="Save"
              onPress={onSaveImageAsync}
            />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button label="Choose a photo" onPress={pickImageAsync} />
          <Button
            label="Use this photo"
            onPress={() => setShowAppOptions(true)}
          />
        </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  optionsContainer: {
    position: "absolute",
    bottom: 40,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});

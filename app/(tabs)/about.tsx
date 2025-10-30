import { StyleSheet, Text, View } from "react-native";

export default function About() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>À propos de cette application</Text>
            <Text style={styles.description}>
                Cette application est un exemple de projet React Native avec Expo.
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        textAlign: "center",
    },
});
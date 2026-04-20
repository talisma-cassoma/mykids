import { TouchableOpacity, Text, View, StyleSheet } from "react-native"
import { useGame } from "@/context/gameContext";
import { Header } from "@/components/Header";
import { SafeAreaView } from 'react-native-safe-area-context';

export function PauseScreen() {
    const scores = 40
    return (
        // <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* <Header gameDescription="Match the words"
                    timer={{
                        isActive: true,
                        mode: "decreasing",
                    }}
                    score={{
                        isActive: true,
                        score: 100,
                        total: 100,
                    }} /> */}
                <Text>
                    pause {JSON.stringify(scores)}
                </Text>
            </View>
        // </SafeAreaView >
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 100,
        paddingHorizontal: 60,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    header: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
        height: "auto",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        //justifyContent: "space-between",
        gap: 20,
        maxWidth: 500,
    },
    card: {
        backgroundColor: "#fff8f8",
        padding: 15,
        marginVertical: 8,
        borderRadius: 12,
        flex: 1,
        borderWidth: 1,
        borderColor: "gray",
        borderBottomWidth: 5,
        //width: 140,
        alignItems: "center",
    },
    text: {
        fontSize: 16,
    },
    selected: {
        backgroundColor: "#cde1ff",
    },
    matched: {
        backgroundColor: "#a5d6a7",
    },
});
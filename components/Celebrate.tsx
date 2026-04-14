
import { Image, useColorScheme, View, StyleSheet, Text } from "react-native";
import { Redirect } from "expo-router";
import { useWordPairGame } from "@/context/gameContext";


export function Celebrate() {
    const { stageScores } = useWordPairGame();
    return (
        <View style={styles.container}>
            <Image
                source={require("@/assets/images/celebrate.gif")}
                style={{
                    width: 200,
                    height: 178,
                    marginTop: 24,
                    marginBottom: 28
                }}
            />
            <View style={{flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
            {stageScores.map((stage, i) => (
                <Text key={i}>
                    {stage.phaseName} ({stage.gameType}) : {stage.score} / {stage.total}
                </Text>
            ))}
            </View>
        </View>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 150,
        paddingHorizontal: 60,
        alignItems: "center",
        justifyContent: "flex-start",

    }
});

import { TouchableOpacity, Text } from "react-native"
import { useGame } from "@/context/gameContext";


export function Button() {
    const { nextStage, status, } = useGame()
    return (
        <TouchableOpacity
            onPress={() => {
                // ✅ fim da fase
                if (status === "playing") {
                    setTimeout(() => {
                        nextStage();
                    }, 500);
                }
            }}
            style={{
                marginTop: 20,
                backgroundColor: "#a5d6a7",
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 100,
                borderRadius: 8
            }}
        >
            <Text style={{ color: "#fff" }}>Avancer</Text>
        </TouchableOpacity>
    )
}
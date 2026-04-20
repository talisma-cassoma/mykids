import { TouchableOpacity, Text, View, StyleSheet } from "react-native"
import { useGame } from "@/context/gameContext";
import { getRandomStages } from "@/utils/getRandomStages";
import { router } from "expo-router";
//import { MactchingWordsGameScreen } from '@/app/game1';
//import { WriteTheWordsGameScreen } from "@/app/game2";

// export type Stage = {
//   id: string;
//   component: React.JSX.Element;
// };

// const ALL_GAMES: Stage[] = [
//   { id: 'game1', component: <MactchingWordsGameScreen /> },
//   { id: 'game2', component: <WriteTheWordsGameScreen /> },
//   { id: 'game3', component: <WriteTheWordsGameScreen /> },
//   { id: 'game4', component: <MactchingWordsGameScreen /> },
//   { id: 'game5', component: <MactchingWordsGameScreen /> },
//   // { id: 'game3', component: </> },
// ];

export default function StartScreen() {
  const {    stages,
        currentStage,
        progress,
        nextStage } = useGame()
  //const stages = getRandomStages(ALL_GAMES);
  //console.log(stages)

  return (
    <View style={styles.container}>
      <Text>
        ola
      </Text>
      <TouchableOpacity
        onPress={() => router.replace(stages[0])}
        style={{
          marginTop: 20,
          backgroundColor: "#4caf50",
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
          width: 100,
          borderRadius: 8
        }}>
        <Text style={{ color: "#fff" }}>commencer</Text>
      </TouchableOpacity>
    </View>
  )
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
})
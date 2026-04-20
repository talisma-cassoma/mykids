// // import React from "react";
// // import { View, StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// // import { useGame } from "@/context/gameContext";
// // import { EndScreen } from "@/components/Games/EndScreen";
// import { Header } from "@/components/Header";
// // import { StartScreen } from "@/components/Games/StartScreen";

// // export default function GameScreen() {
// //   const { stages, currentStageIndex, status } = useGame();
// //   const stageComponent = stages[currentStageIndex]?.component;

// //   return (
// //     <SafeAreaView style={styles.safe}>
// //       <View style={styles.container}>
// //         <Header />

// //         {status === "idle" && <StartScreen />}

// //         {status === "playing" && stageComponent}

// //         {status === "finished" && <EndScreen />}
// //       </View>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   safe: {
// //     flex: 1,
// //     backgroundColor: "#fff"
// //   },
// //   container: {
// //     flex: 1,
// //     paddingTop: 40,
// //     paddingHorizontal: 20,
// //     paddingBottom:30
// //     //overflowY: "scroll"
// //   },
// // });
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Text,
// } from "react-native";
// import * as Speech from "expo-speech";

// import { Button } from "@/components/Button";
// import { PauseScreen } from "@/app/PauseScreen";
// import { useGame } from "@/context/gameContext";
// import { gameData, GameStage } from "@/utils/lessons";

// export interface WordPair {
//   id: string;
//   fr: string;
//   ar: string;
// }

// export default function MatchGame() {
//   const {
//     status,
//     startTimer,
//     pauseTimer,
//     setIsTimerActive,
//     setTimerMode,
//     resetTimer,
//     setScore,
//     nextStage,
//     stages,
//     currentStageIndex,
//     time,
//   } = useGame();

//   // 🎲 estado da fase
//   const [currentLesson, setCurrentLesson] = useState<GameStage | null>(null);

//   const [matched, setMatched] = useState<string[]>([]);
//   const [phaseScore, setPhaseScore] = useState(0);

//   const [leftWords, setLeftWords] = useState<WordPair[]>([]);
//   const [rightWords, setRightWords] = useState<WordPair[]>([]);

//   const [selectedLeft, setSelectedLeft] = useState<WordPair | null>(null);
//   const [selectedRight, setSelectedRight] = useState<WordPair | null>(null);

//   const currentStage = stages[currentStageIndex];
//   const stageId = currentStage?.id;

//   // 🔊 fala
//   const speak = useCallback((text: string, lang: string) => {
//     Speech.stop();
//     Speech.speak(text, { language: lang, pitch: 1, rate: 0.9 });
//   }, []);

//   // 🎲 escolher fase aleatória (uma vez)
//   useEffect(() => {
//     const randomIndex = Math.floor(Math.random() * gameData.length);
//     setCurrentLesson(gameData[randomIndex]);
//   }, []);

//   const data = currentLesson?.wordPairs ?? [];
//   const totalWords = data.length;
//   const isPhaseCompleted = matched.length === totalWords;

//   // 🔀 iniciar fase
//   useEffect(() => {
//     if (!data.length) return;

//     const shuffled = [...data].sort(() => Math.random() - 0.5);

//     setLeftWords(data);
//     setRightWords(shuffled);

//     setMatched([]);
//     setPhaseScore(0);
//     setSelectedLeft(null);
//     setSelectedRight(null);
//   }, [currentLesson]);

//   // 🎯 lógica de match
//   useEffect(() => {
//     if (!selectedLeft || !selectedRight) return;

//     const isMatch = selectedLeft.id === selectedRight.id;

//     if (isMatch && !matched.includes(selectedLeft.id)) {
//       const newScore = phaseScore + 1;

//       setMatched((prev) => [...prev, selectedLeft.id]);
//       setPhaseScore(newScore);

//       if (stageId) {
//         setScore(
//           "trouvez les mots equivalent",
//           `${newScore / totalWords}`
//         );
//       }
//     }

//     setTimeout(() => {
//       setSelectedLeft(null);
//       setSelectedRight(null);
//     }, 200);
//   }, [selectedLeft, selectedRight]);

//   // ⏱ fim pelo tempo
//   useEffect(() => {
//     if (time === 0) {
//       setScore(
//         "trouvez les mots equivalent",
//         `${phaseScore / totalWords}`
//       );
//       nextStage();
//     }
//   }, [time]);

//   // ⏱ timer controle
//   useEffect(() => {
//     resetTimer();

//     if (status === "playing") {
//       setIsTimerActive(true);
//       setTimerMode("decreasing");
//       startTimer();
//     } else {
//       pauseTimer();
//     }
//   }, [status]);

//   // ⏸ pausa
//   if (status === "paused") {
//     return <PauseScreen />;
//   }

//   // 🎨 render left
//   const renderLeft = ({ item }: { item: WordPair }) => {
//     const isMatched = matched.includes(item.id);

//     return (
//       <TouchableOpacity
//         style={[
//           styles.card,
//           isMatched && styles.matched,
//           selectedLeft?.id === item.id && styles.selected,
//         ]}
//         onPress={() => {
//           if (!isMatched) {
//             setSelectedLeft(item);
//             speak(item.fr, "fr-FR");
//           }
//         }}
//       >
//         <Text style={styles.text}>{item.fr}</Text>
//       </TouchableOpacity>
//     );
//   };

//   // 🎨 render right
//   const renderRight = ({ item }: { item: WordPair }) => {
//     const isMatched = matched.includes(item.id);

//     return (
//       <TouchableOpacity
//         style={[
//           styles.card,
//           isMatched && styles.matched,
//           selectedRight?.id === item.id && styles.selected,
//         ]}
//         onPress={() => {
//           if (!isMatched) {
//             setSelectedRight(item);
//             speak(item.ar, "ar-MA");
//           }
//         }}
//       >
//         <Text style={styles.text}>{item.ar}</Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//   <View style={{ flex: 1 }}>
//          <Header />
//          {(status !== "playing")? (
//            <PauseScreen />
//          ):(
//         <View style={styles.container}>
//           <View style={styles.gameArea}>
//             <FlatList
//               data={leftWords}
//               renderItem={renderLeft}
//               keyExtractor={(item) => item.id}
//               style={styles.list}
//             />

//             <FlatList
//               data={rightWords}
//               renderItem={renderRight}
//               keyExtractor={(item) => item.id}
//               style={styles.list}
//             />
//           </View>

//           {isPhaseCompleted && (
//             <View style={styles.buttonContainer}>
//               <Button />
//             </View>
//           )}
//         </View>
//          )}
//       </View>
// </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: "#fff"
//   },
//   containerG: {
//    flex: 1,
//   paddingHorizontal: 20,
//   paddingBottom: 30,
//     //overflowY: "scroll"
//   },
//   container: {
//     flex: 1,
//   },

//   gameArea: {
//     flexDirection: "row",
//     gap: 12,
//     padding: 10,
//     maxWidth: 500,
//     minHeight: 400,
//     justifyContent: "space-around",
//     alignSelf: "center",
//   },

//   list: {
//     paddingBottom: 20,
//     width: 100,
//   },

//   card: {
//     backgroundColor: "#fff8f8",
//     padding: 12,
//     marginVertical: 6,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     alignItems: "center",
//   },

//   text: {
//     fontSize: 16,
//   },

//   selected: {
//     backgroundColor: "#cde1ff",
//   },

//   matched: {
//     backgroundColor: "#a5d6a7",
//   },

//   buttonContainer: {
//     margin: 20,
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
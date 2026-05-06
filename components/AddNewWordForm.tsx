import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/Button";
import { IconX } from "@tabler/icons-react-native";

export function AddNewWorldForm({ selectedLessonId }: { selectedLessonId: string }) {
  
  console.log("selectedLessonId", selectedLessonId);

  const { addWordPair} = useData();

  const [showForm, setShowForm] = useState(false);
  const [fr, setFr] = useState("");
  const [ar, setAr] = useState("");

  function handleSubmit() {
    if (!selectedLessonId || !fr || !ar) return;

    addWordPair(selectedLessonId, fr, ar);

    // reset
    setFr("");
    setAr("");
    setShowForm(false);
  }

  if (!showForm) {
    return (
      <Button onPress={() => setShowForm(true)}>
        <Button.Title>Ajouter un mot</Button.Title>
      </Button>
    );
  }

  return (

    <View style={styles.container}>
      <Text style={styles.label}>Choisir une leçon</Text>

      <TextInput
        placeholder="Mot en français"
        value={fr}
        onChangeText={setFr}
        style={styles.input}
      />

      <TextInput
        placeholder="Mot en arabe"
        value={ar}
        onChangeText={setAr}
        style={styles.input}
      />

      <View style={styles.actions}>
        <Button
          onPress={() => {
            handleSubmit();
      
          }}
        >
          <Button.Title>Enregistrer</Button.Title>
        </Button>

        <Button onPress={() => setShowForm(false)}>
          <Button.Title>Annuler</Button.Title>
        </Button>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    gap: 10,
    padding: 10,
  },
  label: {
    fontWeight: "bold",
  },
  lessonList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lessonItem: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  selectedLesson: {
    backgroundColor: "#ddd",
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
});
import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/Button";
import { IconPlus } from "@tabler/icons-react-native";

export function AddNewLessonForm() {
  

  const { addLesson } = useData();

  const [showForm, setShowForm] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
 

  function handleSubmit() {
    if (!lessonTitle) return;

    addLesson(lessonTitle);
    // reset
    setLessonTitle("");
    setShowForm(false);
  }

  if (!showForm) {
    return (
      <Button  style={{ width:"100%", flexDirection: "row", gap: 10}} onPress={() => setShowForm(true)}>
        <Button.Title>Ajouter une leçon</Button.Title>
        <Button.Icon icon={IconPlus} />
      </Button>
    );
  }

  return (

    <View style={styles.container}>
      <Text style={styles.label}>Choisir une leçon</Text>

      <TextInput
        placeholder="Mot en français"
        value={lessonTitle}
        onChangeText={setLessonTitle}
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
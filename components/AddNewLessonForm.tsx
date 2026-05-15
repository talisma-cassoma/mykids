import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/Button";
import { IconPlus } from "@tabler/icons-react-native";

type LessonType = "text" | "vocabulary";

export function AddNewLessonForm() {
  const { addLesson } = useData();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<LessonType>("vocabulary");

  const [lessonTitle, setLessonTitle] = useState("");
  const [arText, setArText] = useState("");
  const [frText, setFrText] = useState("");

  function reset() {
    setLessonTitle("");
    setArText("");
    setFrText("");
    setType("vocabulary");
  }

  async function handleSubmit() {
    if (!lessonTitle) return;

    if (type === "text") {
      if (!arText || !frText) return;

      await addLesson(lessonTitle, "text", arText, frText);
    } else {
      await addLesson(lessonTitle, "vocabulary");
    }

    reset();
    setShowForm(false);
  }

  if (!showForm) {
    return (
      <Button
        style={{ width: "100%", flexDirection: "row", gap: 10 }}
        onPress={() => setShowForm(true)}
      >
        <Button.Title>Ajouter une leçon</Button.Title>
        <Button.Icon icon={IconPlus} />
      </Button>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type de leçon</Text>

      {/* SELECT TYPE */}
      <View style={styles.typeRow}>
        <Button
          onPress={() => setType("vocabulary")}
          style={type === "vocabulary" ? styles.selected : styles.notSelected}
        >
          <Button.Title>Vocabulary</Button.Title>
        </Button>

        <Button
          onPress={() => setType("text")}
          style={type === "text" ? styles.selected : styles.notSelected}
        >
          <Button.Title>Text</Button.Title>
        </Button>
      </View>

      {/* TITLE */}
      <View>
        <Text style={styles.label}>Titre de la leçon</Text>
        <TextInput
          placeholder="Titre de la leçon"
          value={lessonTitle}
          onChangeText={setLessonTitle}
          style={styles.input}
        />
      </View>

      {/* CONDITIONAL FIELDS */}
      {type === "text" && (
        <>
          <View>
            <Text style={styles.label}>Texte en arabe</Text>
            <TextInput
              placeholder="Texte en arabe"
              value={arText}
              onChangeText={setArText}
              style={styles.input}
            />
          </View>
          <View>
            <Text style={styles.label}>Traduction en français</Text>
            <TextInput
              placeholder="Traduction en français"
              value={frText}
              onChangeText={setFrText}
              style={styles.input}
            />
          </View>
        </>
      )}

      <View style={styles.actions}>
        <Button onPress={handleSubmit}>
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
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  selected: {
     backgroundColor: "#a5d6a7",
  },
  notSelected: {
    backgroundColor: "#ddd",
  },

});
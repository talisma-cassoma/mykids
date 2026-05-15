import React from "react";
import * as Speech from "expo-speech";
import { GameStage, GameText, SentenceData } from "@/types";

export const gameData: GameStage[] = [
  {
    id: "1",
    lessonTitle: "salutations",
    wordPairs: [
      { id: "1", fr: "Bonjour", ar: "مرحبا" },
      { id: "2", fr: "Merci", ar: "شكرا" },
      { id: "3", fr: "Chat", ar: "قط" },
      { id: "4", fr: "Maison", ar: "منزل" },
    ],
  },
  {
    id: "2",
    lessonTitle: "verbe ecrire au présent",
    wordPairs: [
      { id: "5", fr: "j'écris", ar: "أكتب" },
      { id: "6", fr: "tu écris (m)", ar: "تكتب" },
      { id: "7", fr: "tu écris (f)", ar: "تكتبين" },
      { id: "8", fr: "il écrit", ar: "يكتب" },
      { id: "9", fr: "elle écrit", ar: "تكتب" },
      { id: "10", fr: "nous écrivons", ar: "نكتب" },
      { id: "11", fr: "vous écrivez (m)", ar: "تكتبون" },
      { id: "12", fr: "vous écrivez (f)", ar: "تكتبن" },
      { id: "13", fr: "ils écrivent", ar: "يكتبون" },
      { id: "14", fr: "elles écrivent", ar: "يكتبن" },
    ],
  },
  {
    id: "3",
    lessonTitle: "verbe ecrire au passé composé",
    wordPairs: [
      { id: "15", fr: "j'ai écrit", ar: "كتبت" },
      { id: "16", fr: "tu as écrit (m)", ar: "كتبت" },
      { id: "17", fr: "tu as écrit (f)", ar: "كتبتين" },
      { id: "18", fr: "il a écrit", ar: "كتب" },
      { id: "19", fr: "elle écrit", ar: "تكتب" },
      { id: "20", fr: "nous écrivons", ar: "نكتب" },
      { id: "21", fr: "vous écrivez (m)", ar: "تكتبون" },
      { id: "22", fr: "vous écrivez (f)", ar: "تكتبن" },
      { id: "23", fr: "ils écrivent", ar: "يكتبون" },
      { id: "24", fr: "elles écrivent", ar: "يكتبن" },
    ],
  },
  {
    id: "4",
  "lessonTitle": "Vocabulaire : ملعب حيّنا",
  "wordPairs": [
    { "id": "25", "fr": "terrain de jeu", "ar": "مَلْعَب" },
    { "id": "26", "fr": "quartier", "ar": "حَيّ" },
    { "id": "27", "fr": "inauguration", "ar": "تَدْشِين" },
    { "id": "28", "fr": "beau", "ar": "جَمِيل" },
    { "id": "29", "fr": "bibliothèque", "ar": "مَكْتَبَة" },
    { "id": "30", "fr": "maison des jeunes", "ar": "دَار الشَّبَاب" },
    { "id": "31", "fr": "se renforcer", "ar": "تَعَزَّز" },
    { "id": "32", "fr": "nous nous sommes mis d’accord", "ar": "اتَّفَقْنَا" },
    { "id": "33", "fr": "répartition", "ar": "تَوْزِيع" },
    { "id": "34", "fr": "séances", "ar": "حِصَص" },
    { "id": "35", "fr": "groupes", "ar": "مَجْمُوعَات" },
    { "id": "36", "fr": "animateur", "ar": "مُنَشِّط" },
    { "id": "37", "fr": "espace", "ar": "فَضَاء" },
    //{ "id": "38", "fr": "activités", "ar": "أَنْشِطَة" },
    { "id": "39", "fr": "passer du temps", "ar": "نَقْضِي وَقْتًا" },
    { "id": "41", "fr": "esprits", "ar": "عُقُول" },
    { "id": "42", "fr": "préserver", "ar": "نُحَافِظ" },
    { "id": "43", "fr": "santé", "ar": "صِحَّة" }
  ]
},
{
  "id": "5",
  "lessonTitle": "Vocabulaire : le voisin",
  "wordPairs": [
    { "id": "44", "fr": "mon voisin", "ar": "جَارِي" },
    { "id": "45", "fr": "sa maison", "ar": "بَيْتُهُ" },
    { "id": "46", "fr": "proche", "ar": "قَرِيب" },
    { "id": "47", "fr": "amour", "ar": "حُبّ" },
    { "id": "48", "fr": "affection", "ar": "عَطْف" },
    { "id": "49", "fr": "famille", "ar": "أَهْل" },
    { "id": "50", "fr": "aide", "ar": "عَوْن" },
    { "id": "51", "fr": "miséricorde", "ar": "رَحْمَة" },
    { "id": "52", "fr": "le voisin", "ar": "الْجَار" },
    { "id": "53", "fr": "obligation", "ar": "فَرْض" },
    { "id": "54", "fr": "nous l’appelons", "ar": "نَدْعُوهُ" },
    { "id": "56", "fr": "sincérité", "ar": "صَفَاء" },
    { "id": "59", "fr": "tout le temps", "ar": "كُلَّ وَقْت" }
  ]
}

];


export const gameText: GameText[]  = [
  {
    id: "1",
    title: "الحيوانات",
    content: {
        arabic_text:"لسارة قطة لطيفة، تحبها كثيرًا، وتقدم لها الطعام بانتظام، وتعتني بصحتها. وبعد مدة لاحظت سارة أن قطتها أصبحت تأخذ الطعام وتختفي بسرعة، دون أن تتناول منه شيئًا. قررت سارة أن تكتشف السرّ. وعندما حان وقت الطعام، قدمت لقطتها سمكة؛ فأخذتها، وانطلقت كالسهم تعدو. تبعتها سارة، وهي تتجه نحو مكان مهجور، فرأتها تضع السمكة أمام قطة أخرى، ولدت حديثًا قطيطات. تعجبت سارة، وأصبحت منذ ذلك اليوم، تقدم لقطتها مزيدًا من الطعام.",
        french_translation: "Sara a une gentille chatte qu’elle aime beaucoup. Elle lui donne régulièrement de la nourriture et prend soin de sa santé. Après quelque temps, Sara remarqua que sa chatte prenait la nourriture et disparaissait rapidement sans rien manger. Sara décida de découvrir le secret. Quand l’heure du repas arriva, elle donna un poisson à sa chatte ; celle-ci le prit et partit en courant comme une flèche. Sara la suivit vers un endroit abandonné et la vit poser le poisson devant une autre chatte qui venait de mettre bas à de petits chatons. Sara fut étonnée, et depuis ce jour-là, elle donna davantage de nourriture à sa chatte.",
    }

}
]


export const useSpeech = () => {
    const speak = React.useCallback((text: string, lang: string) => {
        return new Promise<void>((resolve, reject) => {
            Speech.stop();

            Speech.speak(text, {
                language: lang,
                pitch: 1,
                rate: 0.9,

                onDone: () => resolve(),
                onStopped: () => resolve(),
                onError: (error) => reject(error),
            });
        });
    }, []);

    const stop = React.useCallback(() => {
        Speech.stop();
    }, []);

    return { speak, stop };
};


export function TimerConverter(time: number){
if(time === undefined) return ""
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}` 
}

export type SentenceItem =
    | {
        type: "word";
        value: string;
    }
    | {
        type: "drop";
        id: string;
        answer: string;
    };

export function sentenceToText(
  sentence: SentenceItem[]
) {
  return sentence
    .map((item) => {
      if (item.type === "word") {
        return item.value;
      }

      return item.answer;
    })
    .join(" ");
}

export function splitIntoSentences(arabic: string, french: string) {
  const arabicSentences = arabic
    .split(/[.,،]/) // ponto, vírgula árabe e ocidental
    .map(s => s.trim())
    .filter(Boolean);

  const frenchSentences = french
    .split(/[.,]/)
    .map(s => s.trim())
    .filter(Boolean);

  return arabicSentences.map((ar, index) => ({
    arabic: ar,
    french: frenchSentences[index] ?? "",
  }));
}
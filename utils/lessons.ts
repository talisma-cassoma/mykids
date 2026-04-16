export interface WordPair {
  id: string;
  fr: string;
  ar: string;
}

export interface GameStage {
  lessonTitle: string;
  wordPairs: WordPair[];
}

export const gameData: GameStage[] = [
  {
    lessonTitle: "salutations",
    wordPairs: [
      { id: "1", fr: "Bonjour", ar: "مرحبا" },
      { id: "2", fr: "Merci", ar: "شكرا" },
      { id: "3", fr: "Chat", ar: "قط" },
      { id: "4", fr: "Maison", ar: "منزل" },
    ],
  },
  {
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
    { "id": "38", "fr": "activités", "ar": "أَنْشِطَة" },
    { "id": "39", "fr": "passer du temps", "ar": "نَقْضِي وَقْتًا" },
    { "id": "40", "fr": "développer", "ar": "نُنَمِّي" },
    { "id": "41", "fr": "esprits", "ar": "عُقُول" },
    { "id": "42", "fr": "préserver", "ar": "نُحَافِظ" },
    { "id": "43", "fr": "santé", "ar": "صِحَّة" }
  ]
},
{
  "lessonTitle": "Vocabulaire : le voisin",
  "wordPairs": [
    { "id": "44", "fr": "mon voisin", "ar": "جَارِي" },
    { "id": "45", "fr": "sa maison (à lui)", "ar": "بَيْتُهُ" },
    { "id": "46", "fr": "proche", "ar": "قَرِيب" },
    { "id": "47", "fr": "amour", "ar": "حُبّ" },
    { "id": "48", "fr": "affection", "ar": "عَطْف" },
    { "id": "49", "fr": "famille", "ar": "أَهْل" },
    { "id": "50", "fr": "aide", "ar": "عَوْن" },
    { "id": "51", "fr": "miséricorde", "ar": "رَحْمَة" },
    { "id": "52", "fr": "le voisin", "ar": "الْجَار" },
    { "id": "53", "fr": "devoir / obligation", "ar": "فَرْض" },
    { "id": "54", "fr": "nous l’appelons", "ar": "نَدْعُوهُ" },
    { "id": "55", "fr": "il répond", "ar": "يُجِيب" },
    { "id": "56", "fr": "pureté / sincérité", "ar": "صَفَاء" },
    { "id": "57", "fr": "il ne s’absente pas", "ar": "لَا يَغِيب" },
    { "id": "58", "fr": "je reste / je continue", "ar": "دُمْتُ" },
    { "id": "59", "fr": "tout le temps", "ar": "كُلَّ وَقْت" }
  ]
}
];
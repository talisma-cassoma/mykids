export interface WordPair {
  id: string;
  fr: string;
  ar: string;
}

export interface GameText{
    id: string;
    title: string;
    content: {
        arabic_text: string;
        french_translation: string;
    };
}

export interface GameStage {
   id: string; // 👈 adicionar isso
  lessonTitle: string;
  wordPairs: WordPair[];
}


export type SentenceData = {
    translation: string;

    sentence: SentenceItem[];
};

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
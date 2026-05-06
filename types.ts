export interface WordPair {
  id: string;
  fr: string;
  ar: string;
}

export interface GameStage {
   id: string; // 👈 adicionar isso
  lessonTitle: string;
  wordPairs: WordPair[];
}
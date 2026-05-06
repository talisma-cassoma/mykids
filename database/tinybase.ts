import { createStore } from 'tinybase';

export const store = createStore();

store.setTables({
  lessons: {},
  wordPairs: {},
});
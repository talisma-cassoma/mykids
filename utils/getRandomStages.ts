type Stage = {
  id: string;
  component: React.JSX.Element;
};

export function getRandomStages(ALL_GAMES: Stage[] = []): Stage[] {
  const shuffled = [...ALL_GAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
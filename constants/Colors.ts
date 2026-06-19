/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    box: "#a5d6a7",

    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    button: "#4caf50",

    card: "#F7F7F7",

    // botão selecionado
    selectedBg: "#E8F1FF",
    selectedBorder: "#4F8EF7",

    // botão correto / matched
    matchedBg: "#E8F8EE",
    matchedBorder: "#22C55E",

  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    
    tint: tintColorDark,
    
    icon: "#fff",
    box: "#687076",

    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

     button: "#a5d6a7",
      
     card: "#333",
      
    selectedBg: "#1E3A5F",
    selectedBorder: "#60A5FA",

    matchedBg: "#163D2A",
    matchedBorder: "#34D399",
  },
};

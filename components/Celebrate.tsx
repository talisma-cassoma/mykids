
import { Image, useColorScheme, View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";


export function Celebrate() {

    return (
        <View style={styles.container}>
            <Image
                source={require("@/assets/images/celebrate.gif")}
                style={{
                    width: 200,
                    height: 178,
                    marginTop: 24,
                    marginBottom: 28
                }}
            />
        </View>)
}

const styles = StyleSheet.create({
    container: {
          flex: 1,
    backgroundColor: "#fff",
    paddingTop: 150,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "flex-start",

    }
});

import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function BuilderScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.text}>Builder screen</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  text: {
    color: "#fff",
  },
});

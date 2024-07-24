import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { createTable } from "@/database";


export default function App() {
  useEffect(() => {
    const initDB = async () => {
      await createTable();
    };
    initDB().catch(console.error);
  }, []);
  
  const [textInput, setTextInput] = useState("");
  const router = useRouter();
 const handlePress = () => {
   router.push({ pathname: "result", params: { textInput } });
 };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paste your receipt here</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Enter receipt data"
        multiline
        numberOfLines={10}
        onChangeText={(textInput) => setTextInput(textInput)}
        value={textInput}
      />
      <TouchableOpacity onPress={handlePress}>
        <Text style={styles.button}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  textArea: {
    flex:0.8,
    justifyContent: "flex-start",
    textAlignVertical: "top",
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
  }
});

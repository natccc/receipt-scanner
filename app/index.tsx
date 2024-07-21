import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const ReceiptScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [items, setItems] = useState<
    Array<{ id: string; text: string; category: string }>
  >([]);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current?.takePictureAsync();
      setImageUri(photo.uri);
      processImage(photo.uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.uri);
      processImage(result.uri);
    }
  };

  const processImage = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      const response = await axios.post(
        "http://192.168.1.129:3000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setText(response.data.text);
      parseItems(response.data.text);
    } catch (err) {
      console.error(err);
    }
  };

  const parseItems = (text: string) => {
    const lines = text.split("\n");
    const parsedItems = lines.map((line, index) => ({
      id: index.toString(),
      text: line,
      category: "uncategorized",
    }));
    setItems(parsedItems);
  };

  const categorizeItem = (id: string, category: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, category } : item
    );
    setItems(updatedItems);
  };

  const calculateSum = (category: string) => {
    return items
      .filter((item) => item.category === category)
      .reduce(
        (sum, item) =>
          sum + parseFloat(item.text.match(/\d+(\.\d{1,2})?/g)?.[0] || "0"),
        0
      )
      .toFixed(2);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleCapture}>
            <Text style={styles.text}>Capture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}
      <Text>{text}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.text}</Text>
            <View style={styles.buttonGroup}>
              <Button
                title="Me"
                onPress={() => categorizeItem(item.id, "me")}
              />
              <Button
                title="Friend"
                onPress={() => categorizeItem(item.id, "friend")}
              />
              <Button
                title="Shared"
                onPress={() => categorizeItem(item.id, "shared")}
              />
            </View>
          </View>
        )}
      />
      <View style={styles.summary}>
        <Text>Me: ${calculateSum("me")}</Text>
        <Text>Friend: ${calculateSum("friend")}</Text>
        <Text>Shared: ${calculateSum("shared")}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    margin: 20,
  },
  text: {
    fontSize: 18,
    color: "#000",
  },
  imagePreview: {
    width: 200,
    height: 200,
    margin: 20,
    alignSelf: "center",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  buttonGroup: {
    flexDirection: "row",
  },
  summary: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});

export default ReceiptScannerScreen;

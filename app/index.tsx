import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
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
      <View className="flex-1 justify-center items-center">
        <Text className="text-center">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
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
        "http://192.168.1.129:3000/process",
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
    <View className="flex-1 justify-center items-center p-5">
      <View className="bg-slate-600 w-full h-full mb-4">
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View className="flex-1 flex-row justify-center items-end mb-5">
            <TouchableOpacity
              className="flex-1 justify-center items-center bg-white rounded p-2 m-5"
              onPress={handleCapture}
            >
              <Text className="text-lg font-bold text-black">Capture</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      
        <Text>{text}</Text>
        <Button title="Pick an Image" onPress={handlePickImage} />
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row justify-between p-2 border-b border-gray-300">
              <Text>{item.text}</Text>
              <View className="flex-row">
                <TouchableOpacity
                  className={`mx-1 p-1 rounded border ${
                    item.category === "me" ? "bg-gray-300" : "bg-gray-200"
                  }`}
                  onPress={() => categorizeItem(item.id, "me")}
                >
                  <Text>Me</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`mx-1 p-1 rounded border ${
                    item.category === "friend" ? "bg-gray-300" : "bg-gray-200"
                  }`}
                  onPress={() => categorizeItem(item.id, "friend")}
                >
                  <Text>Friend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`mx-1 p-1 rounded border ${
                    item.category === "shared" ? "bg-gray-300" : "bg-gray-200"
                  }`}
                  onPress={() => categorizeItem(item.id, "shared")}
                >
                  <Text>Shared</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        <View className="p-2 border-t border-gray-300">
          <Text>Me: ${calculateSum("me")}</Text>
          <Text>Friend: ${calculateSum("friend")}</Text>
          <Text>Shared: ${calculateSum("shared")}</Text>
        </View>
      </View>
    </View>
  );
};

export default ReceiptScannerScreen;

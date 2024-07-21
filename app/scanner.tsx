import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

const ReceiptScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>("");
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
        <Button onPress={requestPermission} title="Grant Permission" />
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
      const result = await TextRecognition.recognize(uri);
      setRecognizedText(result.text);

      console.log("Recognized text:", result.text);

      for (let block of result.blocks) {
        console.log("Block text:", block.text);
        console.log("Block frame:", block.frame);

        for (let line of block.lines) {
          console.log("Line text:", line.text);
          console.log("Line frame:", line.frame);
        }
      }
    } catch (error) {
      console.error("Error recognizing text:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      <Text>Recognized Text:</Text>
      <Text>{recognizedText}</Text>
      <Button title="Pick an Image" onPress={handlePickImage} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  camera: {
    width: "100%",
    height: 400,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
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
  },
});

export default ReceiptScannerScreen;

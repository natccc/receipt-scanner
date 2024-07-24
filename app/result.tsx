import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert, Button } from "react-native";
import { parseReceipt, ReceiptItemProps } from "@/utils/parseReceipt";
import RadioButton from "@/components/RadioButton";
import { useLocalSearchParams } from "expo-router";
import {
  saveData,
  loadData,
  deleteAllData,
  CategorizedReceiptItem,
} from "@/database";

const categories = [
  { label: "Shared", color: "#F44336" },
  { label: "Me", color: "#4CAF50" },
  { label: "Friend", color: "#FFC107" },
];

const calculateTotal = (items: CategorizedReceiptItem[]) => {
  return items.reduce((acc, curr) => acc + curr.price, 0).toFixed(2);
};

const calculateCategoryTotal = (
  items: CategorizedReceiptItem[],
  category: string
) => {
  return items
    .reduce(
      (acc, curr) => acc + (curr.category === category ? curr.price : 0),
      0
    )
    .toFixed(2);
};

export default function ResultScreen() {
  // const { data } = require("../data");
  const { textInput } = useLocalSearchParams();
  const result = parseReceipt(textInput);
  const [categorizedItems, setCategorizedItems] = useState<
    CategorizedReceiptItem[]
  >(result.items.map((item) => ({ ...item, category: "Shared" })));

    useEffect(() => {
      loadData((loadedItems) => {
        if (loadedItems.length > 0) {
          setCategorizedItems(loadedItems);
        }
      }).catch(console.error);
    }, []);
  
  const categorizeItem = (index: number, category: string) => {
    const newItems = [...categorizedItems];
    newItems[index].category = category;
    setCategorizedItems(newItems);
  };

  const saveDataToDB = async () => {
    try {
      // await deleteAllData();
      for (const item of categorizedItems) {
        await saveData(item.name, item.price, item.category);
      }
      Alert.alert("Success", "Data saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save data.");
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: CategorizedReceiptItem;
    index: number;
  }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.itemText}>
          {item.name} | £{item.price.toFixed(2)}
        </Text>
        <View style={styles.buttonContainer}>
          {categories.map((category) => (
            <RadioButton
              key={category.label}
              color={category.color}
              selected={item.category === category.label}
              onPress={() => categorizeItem(index, category.label)}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categorizedItems}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
      />
      <Button title="Save Data" onPress={saveDataToDB} />

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Outcome: {result.outcome}</Text>
        <View style={styles.indexContainer}>
          {categories.map((category) => (
            <View style={styles.indexItem} key={category.label}>
              <View
                style={[
                  styles.indexCircle,
                  { backgroundColor: category.color },
                ]}
              ></View>
              <Text style={styles.indexText}>
                {category.label}: £
                {calculateCategoryTotal(categorizedItems, category.label)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.totalText}>
          Total: £{calculateTotal(categorizedItems)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  item: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  indexContainer: {
    marginBottom: 10,
    justifyContent: "space-between",
  },
  indexItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  indexCircle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  indexText: {
    fontSize: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
});

import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { parseReceipt, ReceiptItemProps } from "../utils/parseReceipt";
import RadioButton from "../components/RadioButton";

type CategorizedReceiptItem = ReceiptItemProps & {
  category: string | null;
};

const categories = [
    { label: "common", color: "#F44336" },
{ label: "me", color: "#4CAF50" },
  { label: "friend", color: "#FFC107" },
];

export default function ResultScreen() {
  const { data, data2, data3 } = require("../data");
  const result = parseReceipt(data);

  const [categorizedItems, setCategorizedItems] = useState<
    CategorizedReceiptItem[]
  >(result.items.map((item) => ({ ...item, category: "common" })));

  const categorizeItem = (index: number, category: string) => {
    const newItems = [...categorizedItems];
    newItems[index].category = category;
    setCategorizedItems(newItems);
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
          {item.name} | {item.price}
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
      <Text style={styles.title}>Parsed Receipt Data</Text>
      <FlatList
        data={categorizedItems}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
      />
      <Text>Outcome: {result.outcome}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  item: {
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    marginRight: 5,
  },
  buttonContainer: {
      flexDirection: "row",
  },
});

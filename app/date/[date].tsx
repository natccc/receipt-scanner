import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { loadDataByDate, CategorizedReceiptItem } from "@/database";

export default function DateItems() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [items, setItems] = useState<CategorizedReceiptItem[]>([]);

  useEffect(() => {
    loadDataByDate((loadedData) => {
      setItems(loadedData[decodeURIComponent(date!)] || []);
    });
  }, [date]);

  const renderItem = ({ item }: { item: CategorizedReceiptItem }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        {item.name} | £{item.price.toFixed(2)} | {item.category}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Items for {decodeURIComponent(date!)}</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  item: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemText: {
    fontSize: 16,
  },
});

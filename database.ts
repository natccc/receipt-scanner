import * as SQLite from "expo-sqlite";
import { format } from "date-fns";

// Open or create the database
const db = SQLite.openDatabaseSync("myDatabase.db");

// Define the interface for a categorized receipt item
export interface CategorizedReceiptItem {
  id?: number;
  name: string;
  price: number;
  category: string;
  timestamp?: string;
}

// Function to create the table if it doesn't exist
export const createTable = async (): Promise<void> => {
  try {
    // await db.execAsync("DROP TABLE IF EXISTS items");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `);
    console.log("Table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  }
};


// Function to save data to the table
export const saveData = async (
  name: string,
  price: number,
  category: string
): Promise<void> => {
  const timestamp = format(new Date(), "dd/MM/yyyy HH:mm"); 
    await db.runAsync(
      "INSERT INTO items (name, price, category, timestamp) VALUES (?, ?, ?, ?)",
      [name, price, category, timestamp]
    );

};


export const loadDataByDate = async (
  callback: (items: { [key: string]: CategorizedReceiptItem[] }) => void
): Promise<void> => {
  const allRows: CategorizedReceiptItem[] = await db.getAllAsync(
    "SELECT * FROM items ORDER BY timestamp DESC"
  );
  const groupedData = allRows.reduce<{
    [key: string]: CategorizedReceiptItem[];
  }>((acc, item) => {
    const timestamp = item.timestamp!
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(item);
    return acc;
  }, {});
  callback(groupedData);
};


// Function to delete all data from the table
export const deleteAllData = async (): Promise<void> => {
  await db.runAsync("DELETE FROM items");
};

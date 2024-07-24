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
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      timestamp TEXT NOT NULL

    );
  `);
};

// Function to save data to the table
export const saveData = async (
  name: string,
  price: number,
  category: string
): Promise<void> => {
  const timestamp = format(new Date(), "dd/MM/yyyy HH:mm"); 
  await db.runAsync(
    "INSERT INTO items (name, price, category) VALUES (?, ?, ?)",
    [name, price, category]
  );
};

// Function to load data from the table
export const loadData = async (
  callback: (items: CategorizedReceiptItem[]) => void
): Promise<void> => {
  const allRows = await db.getAllAsync("SELECT * FROM items");
  callback(allRows as CategorizedReceiptItem[]);
};

// Function to delete all data from the table
export const deleteAllData = async (): Promise<void> => {
  await db.runAsync("DELETE FROM items");
};

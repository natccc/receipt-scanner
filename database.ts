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
export interface ReceiptSummary {
  id?: number;
  timestamp: string;
  total: number;
  categoryTotals: string; 
}
export const selectAll = async (date) => {
  console.log(date,"date in db")
  const result = await db.getAllAsync('SELECT * FROM receiptSummary WHERE timestamp = ?',[date]); 
}
  

// Function to create the table if it doesn't exist
export const createTable = async (): Promise<void> => {
  try {
    // await db.execAsync("DROP TABLE IF EXISTS categorizedItems");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categorizedItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `);

     await db.execAsync(`
      CREATE TABLE IF NOT EXISTS receiptSummary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        total REAL NOT NULL,
        categoryTotals TEXT NOT NULL
      );
    `);


    console.log("Table created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
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
      "INSERT INTO categorizedItems (name, price, category, timestamp) VALUES (?, ?, ?, ?)",
      [name, price, category, timestamp]
    );

};

export const saveReceiptSummary = async (
  total: number,
  categoryTotals: { [key: string]: number }
): Promise<void> => {
    const timestamp = format(new Date(), "dd/MM/yyyy HH:mm"); 
  const categoryTotalsJson = JSON.stringify(categoryTotals);
  await db.runAsync(
    "INSERT INTO receiptSummary (timestamp, total, categoryTotals) VALUES (?, ?, ?)",
    [timestamp, total, categoryTotalsJson]
  );
};

export const loadDataByDate = async (
  callback: (categorizedItems: { [key: string]: CategorizedReceiptItem[] }) => void
): Promise<void> => {
  const allRows: CategorizedReceiptItem[] = await db.getAllAsync(
    "SELECT * FROM categorizedItems ORDER BY timestamp DESC"
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

export const loadReceiptSummaries = async (
 date: string, callback: (summaries: ReceiptSummary[]) => void
): Promise<void> => {
  const summaries: ReceiptSummary[] = await db.getAllAsync(
    "SELECT * FROM receiptSummary WHERE timestamp = ?",[date]
  );
  callback(summaries);
};
// Function to delete all data from the table
export const deleteAllData = async (): Promise<void> => {
  await db.runAsync("DELETE FROM categorizedItems");
};

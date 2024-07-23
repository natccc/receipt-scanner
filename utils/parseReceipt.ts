const { data, data2, data3 } = require("../data");

export interface ReceiptItemProps{
  name: string;
  savings: number;
  price: number;
}

export const parseReceipt = (
  receipt: string
): { items: ReceiptItemProps[]; outcome: string } => {
  const lines = receipt
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const items: ReceiptItemProps[] = [];
  let i = 0;

  while (i < lines.length) {
    const itemName = lines[i++];

    // Skip specific unwanted lines
    if (itemName.startsWith("THINK 25") || itemName.includes("BALANCE DUE")) {
      i++;
      continue;
    }

    let itemPrice;
    while (i < lines.length && !/^[£$\d.]+$/.test(lines[i])) {
      i++;
    }

    if (i < lines.length) {
      itemPrice = lines[i++];
    } else {
      throw new Error(`Price missing for item: ${itemName}`);
    }

    if (!/^[£$\d.]+$/.test(itemPrice)) {
      throw new Error(`Invalid price format for item: ${itemName}`);
    }

    let price = parseFloat(itemPrice.replace(/[£$]/, ""));
    price = Math.round(price * 100) / 100;
    let savings = 0;
    items.push({
      name: itemName,
      savings: savings,
      price: price,
    });

    let savingsPerItem = 0;
    let count = 1;

    // Check for "Nectar Price Saving" and its corresponding savings value
    while (i < lines.length && lines[i].includes("Nectar Price Saving")) {
      const savingsLine = lines[i++];
      const match = savingsLine.match(/(\d+) X Nectar Price Saving/);
      if (match) {
        count = parseInt(match[1], 10);
      }

      if (i < lines.length && /^[-£$\d.]+$/.test(lines[i])) {
        const savingsPrice = lines[i++];
        const totalSavings = parseFloat(savingsPrice.replace(/[£$]/, ""));
        savingsPerItem = totalSavings / count;
        for (let j = items.length - count; j < items.length; j++) {
          if (j >= 0) {
            items[j].savings += -savingsPerItem;
            items[j].price += savingsPerItem;
            items[j].price = Math.round(items[j].price * 100) / 100;
          }
        }
      }
    }
  }
  const balanceDue = lines.length > 0 ? parseFloat(lines.pop()!.slice(1)) : 0;
  const total = items.reduce((acc, item) => acc + item.price, 0);
  const outcome = balanceDue == total ? "Success" : "Unbalanced";
  return { items, outcome };
};

const result = parseReceipt(data);

console.log(result);

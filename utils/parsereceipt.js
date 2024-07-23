"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data = require("../data").data;
var parseReceipt = function (receipt) {
    var lines = receipt
        .split("\n")
        .map(function (line) { return line.trim(); })
        .filter(function (line) { return line.length > 0; });
    var items = [];
    var i = 0;
    while (i < lines.length) {
        var itemName = lines[i++];
        // Skip specific unwanted lines
        if (itemName.startsWith("THINK 25") || itemName.includes("BALANCE DUE")) {
            i++;
            continue;
        }
        var itemPrice = void 0;
        while (i < lines.length && !/^[£$\d.]+$/.test(lines[i])) {
            i++;
        }
        if (i < lines.length) {
            itemPrice = lines[i++];
        }
        else {
            throw new Error("Price missing for item: ".concat(itemName));
        }
        if (!/^[£$\d.]+$/.test(itemPrice)) {
            throw new Error("Invalid price format for item: ".concat(itemName));
        }
        var price = parseFloat(itemPrice.replace(/[£$]/, ""));
        price = Math.round(price * 100) / 100;
        var savings = 0;
        items.push({
            name: itemName,
            savings: savings,
            price: price,
        });
        var savingsPerItem = 0;
        var count = 1;
        // Check for "Nectar Price Saving" and its corresponding savings value
        while (i < lines.length && lines[i].includes("Nectar Price Saving")) {
            var savingsLine = lines[i++];
            var match = savingsLine.match(/(\d+) X Nectar Price Saving/);
            if (match) {
                count = parseInt(match[1], 10);
            }
            if (i < lines.length && /^[-£$\d.]+$/.test(lines[i])) {
                var savingsPrice = lines[i++];
                var totalSavings = parseFloat(savingsPrice.replace(/[£$]/, ""));
                savingsPerItem = totalSavings / count;
                for (var j = items.length - count; j < items.length; j++) {
                    if (j >= 0) {
                        items[j].savings += savingsPerItem;
                        items[j].price += savingsPerItem;
                        items[j].price = Math.round(items[j].price * 100) / 100;
                    }
                }
            }
        }
    }
    var balanceDue = lines.length > 0 ? parseFloat(lines.pop().slice(1)) : 0;
    var total = items.reduce(function (acc, item) { return acc + item.price; }, 0);
    var outcome = balanceDue == total ? "Success" : "Unbalanced";
    return { items: items, outcome: outcome };
};
var result = parseReceipt(data);
console.log(result);

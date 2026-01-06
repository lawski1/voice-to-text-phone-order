// Simple order parser for coffee shop orders
// This is a basic implementation - in production, you'd use NLP/AI for better parsing

const coffeeMenu = {
  'espresso': { price: 2.50, variations: ['single', 'double'] },
  'americano': { price: 3.00 },
  'cappuccino': { price: 3.50 },
  'latte': { price: 3.75, variations: ['vanilla', 'caramel', 'hazelnut'] },
  'mocha': { price: 4.00 },
  'frappuccino': { price: 4.50 },
  'iced coffee': { price: 3.25 },
  'cold brew': { price: 3.75 },
  'tea': { price: 2.50, variations: ['green', 'black', 'herbal'] },
  'hot chocolate': { price: 3.00 },
  'croissant': { price: 2.50 },
  'muffin': { price: 2.75 },
  'bagel': { price: 2.25 },
  'sandwich': { price: 5.50 }
};

const sizeModifiers = {
  'small': 0,
  'medium': 0.50,
  'large': 1.00,
  'extra large': 1.50
};

function parseOrder(text) {
  if (!text) {
    return { items: [], total: 0 };
  }
  
  const lowerText = text.toLowerCase();
  const items = [];
  let total = 0;
  let customerName = null;
  
  // Try to extract customer name (simple pattern: "this is [name]" or "I'm [name]")
  const namePatterns = [
    /(?:this is|i'm|i am|my name is)\s+([a-z]+(?:\s+[a-z]+)?)/i,
    /^([a-z]+(?:\s+[a-z]+)?)\s+(?:here|speaking)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      customerName = match[1].trim();
      break;
    }
  }
  
  // Parse quantities and items
  const quantityPattern = /(\d+)\s*(?:x\s*)?/gi;
  const numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  
  // Find menu items in the text
  for (const [itemName, itemData] of Object.entries(coffeeMenu)) {
    const itemRegex = new RegExp(`\\b${itemName.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (itemRegex.test(lowerText)) {
      // Try to find quantity
      let quantity = 1;
      const itemIndex = lowerText.search(itemRegex);
      const beforeItem = lowerText.substring(Math.max(0, itemIndex - 30), itemIndex);
      
      // Check for numeric quantity
      const numMatch = beforeItem.match(/(\d+)\s*(?:x\s*)?(?:of\s*)?$/);
      if (numMatch) {
        quantity = parseInt(numMatch[1]);
      } else {
        // Check for word numbers
        for (let i = 0; i < numbers.length; i++) {
          if (beforeItem.includes(numbers[i])) {
            quantity = i + 1;
            break;
          }
        }
      }
      
      // Check for size
      let size = 'medium';
      let price = itemData.price;
      for (const [sizeName, sizePrice] of Object.entries(sizeModifiers)) {
        if (lowerText.includes(sizeName)) {
          size = sizeName;
          price = itemData.price + sizePrice;
          break;
        }
      }
      
      // Check for variations
      let fullItemName = itemName;
      if (itemData.variations) {
        for (const variation of itemData.variations) {
          if (lowerText.includes(variation)) {
            fullItemName = `${variation} ${itemName}`;
            break;
          }
        }
      }
      
      items.push({
        name: `${size} ${fullItemName}`,
        quantity: quantity,
        price: price
      });
      
      total += price * quantity;
    }
  }
  
  // If no items found, create a generic order entry
  if (items.length === 0) {
    items.push({
      name: 'Order (needs review)',
      quantity: 1,
      price: 0
    });
  }
  
  return {
    customerName,
    items,
    total: Math.round(total * 100) / 100 // Round to 2 decimal places
  };
}

module.exports = {
  parseOrder,
  coffeeMenu
};


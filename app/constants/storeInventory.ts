/**
 * Store-specific inventory mapping.
 * Each store has its own set of products with barcodes.
 */

export type Product = {
  id: string;
  barcode: string;
  name: string;
  price: number;
  category?: string;
};

export type StoreInventory = {
  [storeId: string]: Product[];
};

// Store-specific inventory
export const STORE_INVENTORY: StoreInventory = {
  'phase1-hostel': [
    {
      id: 'prod-001',
      barcode: '8901234567890',
      name: 'Coca-Cola 250ml',
      price: 40,
      category: 'Beverages',
    },
    {
      id: 'prod-002',
      barcode: '8901234567891',
      name: 'Sprite 250ml',
      price: 40,
      category: 'Beverages',
    },
    {
      id: 'prod-003',
      barcode: '8901234567892',
      name: 'Lay\'s Classic Salted',
      price: 20,
      category: 'Snacks',
    },
    {
      id: 'prod-004',
      barcode: '8901234567893',
      name: 'Maggi Noodles Cup',
      price: 25,
      category: 'Foods',
    },
    {
      id: 'prod-005',
      barcode: '8901234567894',
      name: 'Britannia Biscuit Pack',
      price: 30,
      category: 'Foods',
    },
  ],
  'admin-building': [
    {
      id: 'prod-101',
      barcode: '8901234567895',
      name: 'Tropicana Orange Juice',
      price: 60,
      category: 'Beverages',
    },
    {
      id: 'prod-102',
      barcode: '8901234567896',
      name: 'Frito-Lay Mix Pack',
      price: 45,
      category: 'Snacks',
    },
    {
      id: 'prod-103',
      barcode: '8901234567897',
      name: 'Choco Pie',
      price: 35,
      category: 'Snacks',
    },
    {
      id: 'prod-104',
      barcode: '8901234567898',
      name: 'Red Bull Energy Drink',
      price: 100,
      category: 'Beverages',
    },
    {
      id: 'prod-105',
      barcode: '8901234567899',
      name: 'Parle-G Biscuits',
      price: 25,
      category: 'Foods',
    },
  ],
  'yamuna-hostel': [
    {
      id: 'prod-201',
      barcode: '8901234567900',
      name: 'Minute Maid Juice',
      price: 50,
      category: 'Beverages',
    },
    {
      id: 'prod-202',
      barcode: '8901234567901',
      name: 'Doritos Nacho Cheese',
      price: 50,
      category: 'Snacks',
    },
    {
      id: 'prod-203',
      barcode: '8901234567902',
      name: 'Dark Fantasy Biscuits',
      price: 45,
      category: 'Foods',
    },
    {
      id: 'prod-204',
      barcode: '8901234567903',
      name: 'Amul Milk Pack',
      price: 35,
      category: 'Beverages',
    },
    {
      id: 'prod-205',
      barcode: '8901234567904',
      name: 'Sunfeast Marie Biscuits',
      price: 30,
      category: 'Foods',
    },
  ],
};

/**
 * Get products for a specific store
 */
export const getStoreProducts = (storeId: string | undefined): Product[] => {
  if (!storeId) return [];
  return STORE_INVENTORY[storeId] || [];
};

/**
 * Find product by barcode in store inventory
 */
export const findProductByBarcode = (barcode: string, storeId: string | undefined): Product | undefined => {
  if (!storeId) return undefined;
  const storeProducts = STORE_INVENTORY[storeId] || [];
  return storeProducts.find((p) => p.barcode === barcode);
};

/**
 * Get all products across all stores
 */
export const getAllProducts = (): Product[] => {
  return Object.values(STORE_INVENTORY).flat();
};

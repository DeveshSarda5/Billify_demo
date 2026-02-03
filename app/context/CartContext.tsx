import { createContext, useContext, useState } from 'react';

export type CartItem = {
  barcode: string;
  name: string;
  price: number;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (barcode: string) => void;
  updateQty: (barcode: string, qty: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType>(null as any);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'qty'>) => {
    setItems((prev) => {
      const existing = prev.find(i => i.barcode === item.barcode);
      if (existing) {
        return prev.map(i =>
          i.barcode === item.barcode
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (barcode: string) => {
    setItems(prev => prev.filter(i => i.barcode !== barcode));
  };

  const updateQty = (barcode: string, qty: number) => {
    setItems(prev =>
      prev.map(i =>
        i.barcode === barcode ? { ...i, qty } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
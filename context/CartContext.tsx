import { createContext, useContext, useMemo, useState } from "react";
import { Alert } from "react-native";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;

  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
};

type CartContextType = {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity">) => void;

  removeItem: (id: string) => void;

  updateQty: (id: string, qty: number) => void;

  clearCart: () => void;

  cartTotal: number;

  cartCount: number;

  restaurantId: string | null;
};

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ADD ITEM

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      // DIFFERENT RESTAURANT GUARD

      if (prev.length > 0 && prev[0].restaurantId !== newItem.restaurantId) {
        Alert.alert(
          "Different restaurant",
          "Your cart contains items from another restaurant. Clear cart and continue?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },

            {
              text: "Clear Cart",
              style: "destructive",

              onPress: () => {
                setItems([
                  {
                    ...newItem,
                    quantity: 1,
                  },
                ]);
              },
            },
          ],
        );

        return prev;
      }

      // EXISTING ITEM

      const existingItem = prev.find((item) => item.id === newItem.id);

      if (existingItem) {
        return prev.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      // NEW ITEM

      return [
        ...prev,
        {
          ...newItem,
          quantity: 1,
        },
      ];
    });
  };

  // REMOVE ITEM

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // UPDATE QUANTITY

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: qty,
            }
          : item,
      ),
    );
  };

  // CLEAR CART

  const clearCart = () => {
    setItems([]);
  };

  // TOTAL

  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  // COUNT

  const cartCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  // RESTAURANT ID

  const restaurantId = items.length > 0 ? items[0].restaurantId : null;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        cartTotal,
        cartCount,
        restaurantId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

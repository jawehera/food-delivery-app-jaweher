export type Order = {
  id: string;

  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;

  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];

  subtotal: number;

  deliveryFee: number;

  total: number;

  deliveryAddress: string;

  status: "confirmed" | "preparing" | "delivering" | "delivered";

  rating: number | null;

  createdAt: string;
};

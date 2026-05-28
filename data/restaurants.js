// data/restaurants.js

export const RESTAURANTS = [
  {
    id: "1",
    name: "Pizza Roma",
    cuisine: "Pizza",
    rating: 4.5,
    deliveryTime: "25-35 min",
    deliveryFee: 2.99,
    minOrder: 10.0,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",

    menu: [
      {
        category: "Starters",
        items: [
          {
            id: "1-1",
            name: "Bruschetta",
            description: "Toasted bread with tomatoes and basil",
            price: 6.5,
            image:
              "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f",
          },
          {
            id: "1-2",
            name: "Garlic Bread",
            description: "Crispy garlic bread with cheese",
            price: 5,
            image:
              "https://images.unsplash.com/photo-1509440159596-0249088772ff",
          },
        ],
      },
      {
        category: "Pizza",
        items: [
          {
            id: "1-3",
            name: "Margherita",
            description: "Tomato sauce, mozzarella, basil",
            price: 12,
            image:
              "https://images.unsplash.com/photo-1604382355076-af4b0eb60143",
          },
          {
            id: "1-4",
            name: "Pepperoni",
            description: "Pepperoni, mozzarella cheese",
            price: 14,
            image:
              "https://images.unsplash.com/photo-1628840042765-356cda07504e",
          },
        ],
      },
      {
        category: "Desserts",
        items: [
          {
            id: "1-5",
            name: "Tiramisu",
            description: "Classic Italian dessert",
            price: 7,
            image:
              "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
          },
        ],
      },
      {
        category: "Drinks",
        items: [
          {
            id: "1-6",
            name: "Coca Cola",
            description: "33cl cold drink",
            price: 3,
            image:
              "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
          },
        ],
      },
    ],
  },

  {
    id: "2",
    name: "Burger House",
    cuisine: "Burger",
    rating: 4.7,
    deliveryTime: "20-30 min",
    deliveryFee: 1.99,
    minOrder: 8.0,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",

    menu: [
      {
        category: "Burgers",
        items: [
          {
            id: "2-1",
            name: "Classic Burger",
            description: "Beef patty, lettuce, tomato",
            price: 11.0,
          },
          {
            id: "2-2",
            name: "Cheese Burger",
            description: "Double cheese and beef",
            price: 13.0,
          },
        ],
      },
    ],
  },

  {
    id: "3",
    name: "Asian Food",
    cuisine: "Asian",
    rating: 4.3,
    deliveryTime: "30-40 min",
    deliveryFee: 2.5,
    minOrder: 12.0,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19",

    menu: [
      {
        category: "Noodles",
        items: [
          {
            id: "3-1",
            name: "Chicken Noodles",
            description: "Spicy noodles with chicken",
            price: 13.5,
          },
        ],
      },
    ],
  },

  {
    id: "4",
    name: "Sushi Master",
    cuisine: "Asian",
    rating: 4.8,
    deliveryTime: "35-45 min",
    deliveryFee: 3.5,
    minOrder: 15.0,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",

    menu: [
      {
        category: "Sushi",
        items: [
          {
            id: "4-1",
            name: "Salmon Sushi",
            description: "Fresh salmon slices",
            price: 18.0,
          },
        ],
      },
    ],
  },

  {
    id: "6",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.6,
    deliveryTime: "25-40 min",
    deliveryFee: 2.0,
    minOrder: 9.0,
    image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85",

    menu: [
      {
        category: "Tacos",
        items: [
          {
            id: "6-1",
            name: "Chicken Taco",
            description: "Mexican chicken taco",
            price: 9.5,
          },
        ],
      },
    ],
  },

  {
    id: "7",
    name: "Healthy Bowl",
    cuisine: "Healthy",
    rating: 4.2,
    deliveryTime: "20-30 min",
    deliveryFee: 2.2,
    minOrder: 11.0,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554",

    menu: [
      {
        category: "Bowls",
        items: [
          {
            id: "7-1",
            name: "Avocado Bowl",
            description: "Fresh avocado and vegetables",
            price: 14.0,
          },
        ],
      },
    ],
  },

  {
    id: "8",
    name: "Pasta Milano",
    cuisine: "Italian",
    rating: 4.7,
    deliveryTime: "30-45 min",
    deliveryFee: 3.0,
    minOrder: 13.0,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9",

    menu: [
      {
        category: "Pasta",
        items: [
          {
            id: "8-1",
            name: "Carbonara",
            description: "Creamy pasta with bacon",
            price: 16.0,
          },
        ],
      },
    ],
  },
];

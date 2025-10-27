import { Restaurant } from "../types/aggregated-content";

export const mockRestaurants: Restaurant[] = [
  {
    id: "rest_001",
    slug: "soul-food-spot",
    name: "Soul Food Spot",
    description: "Authentic soul food in the heart of Chicago. Famous for our fried chicken and mac & cheese.",
    cuisine: ["Soul Food", "American", "Southern"],
    logoUrl: "https://images.unsplash.com/photo-1623855244605-ed5c86548028?w=200&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1623855244605-ed5c86548028?w=800&q=80", // Soul food fried chicken
    acceptingOrders: true,
    estimatedPickupTime: 30,
    averageRating: 4.8,
    totalReviews: 156,
  },
  {
    id: "rest_002",
    slug: "chicago-deep-dish-kitchen",
    name: "Chicago Deep Dish Kitchen",
    description: "The best deep dish pizza in Chicago! Made fresh daily with family recipes.",
    cuisine: ["Pizza", "Italian", "American"],
    logoUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=200&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80", // Chicago deep dish pizza
    acceptingOrders: true,
    estimatedPickupTime: 45,
    averageRating: 4.9,
    totalReviews: 203,
  },
  {
    id: "rest_003",
    slug: "harolds-chicken-shack",
    name: "Harold's Chicken Shack",
    description: "Chicago's legendary chicken spot. Crispy, juicy, and perfectly seasoned every time.",
    cuisine: ["Chicken", "American", "Fast Food"],
    logoUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80", // Crispy fried chicken wings
    acceptingOrders: true,
    estimatedPickupTime: 20,
    averageRating: 4.7,
    totalReviews: 445,
  },
  {
    id: "rest_004",
    slug: "taste-of-home-cafe",
    name: "Taste of Home Café",
    description: "Homestyle cooking that reminds you of Sunday dinner at grandma's house.",
    cuisine: ["American", "Comfort Food", "Soul Food"],
    logoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", // Comfort food homestyle
    acceptingOrders: true,
    estimatedPickupTime: 35,
    averageRating: 4.6,
    totalReviews: 89,
  },
  {
    id: "rest_005",
    slug: "wing-stop-express",
    name: "Wing Stop Express",
    description: "Fresh wings tossed in your choice of 12 signature sauces. Perfect game day food!",
    cuisine: ["Wings", "American", "Fast Food"],
    logoUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80", // Buffalo wings restaurant
    acceptingOrders: false,
    estimatedPickupTime: 25,
    averageRating: 4.5,
    totalReviews: 312,
  },
];

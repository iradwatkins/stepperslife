import { StoreProduct } from "../types/aggregated-content";

export const mockStoreProducts: StoreProduct[] = [
  {
    id: "prod_001",
    slug: "chicago-steppin-tshirt",
    name: "Chicago Steppin Classic T-Shirt",
    description: "Premium cotton tee with vintage steppin design",
    price: 29.99,
    compareAtPrice: 39.99,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", // Black t-shirt mockup
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
    ],
    vendorName: "Steppin Apparel",
    vendorSlug: "steppin-apparel",
    category: "Clothing",
    inStock: true,
  },
  {
    id: "prod_002",
    slug: "dance-shoes-mens-black",
    name: "Premium Men's Dance Shoes - Black",
    description: "Professional grade dance shoes with suede sole, perfect for steppin",
    price: 89.99,
    compareAtPrice: 120.00,
    images: [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80", // Men's leather dress shoes
    ],
    vendorName: "Smooth Moves Dance Gear",
    vendorSlug: "smooth-moves",
    category: "Shoes",
    inStock: true,
  },
  {
    id: "prod_003",
    slug: "steppin-elegant-dress",
    name: "Elegant Steppin Dress - Royal Blue",
    description: "Flowing dress perfect for the dance floor with stretch fabric",
    price: 79.99,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", // Evening gown blue elegant
    ],
    vendorName: "Dance Elegance",
    vendorSlug: "dance-elegance",
    category: "Clothing",
    inStock: true,
  },
  {
    id: "prod_004",
    slug: "steppin-music-collection-vol1",
    name: "Chicago Steppin Music Collection Vol. 1",
    description: "Digital download of 50 classic steppin tracks curated by DJ Smooth",
    price: 19.99,
    images: [
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80", // Vinyl records R&B soul
    ],
    vendorName: "Steppin Sounds",
    vendorSlug: "steppin-sounds",
    category: "Music",
    inStock: true,
  },
  {
    id: "prod_005",
    slug: "ladies-dance-heels-silver",
    name: "Women's Dance Heels - Silver",
    description: "Comfortable 2.5\" heels with ankle strap, perfect for all-night dancing",
    price: 69.99,
    compareAtPrice: 85.00,
    images: [
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&q=80", // Women's dance heels silver
    ],
    vendorName: "Smooth Moves Dance Gear",
    vendorSlug: "smooth-moves",
    category: "Shoes",
    inStock: true,
  },
  {
    id: "prod_006",
    slug: "steppin-hat-fedora",
    name: "Classic Fedora Hat",
    description: "Complete your steppin look with this classic fedora",
    price: 39.99,
    images: [
      "https://images.unsplash.com/photo-1533055640609-24b498dfd74c?w=800&q=80", // Fedora hat classic style
    ],
    vendorName: "Steppin Style Accessories",
    vendorSlug: "steppin-style",
    category: "Accessories",
    inStock: true,
  },
];

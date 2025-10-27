import { MagazineArticle } from "../types/aggregated-content";

export const mockMagazineArticles: MagazineArticle[] = [
  {
    id: "article_001",
    slug: "chicago-steppin-history",
    title: "The Rich History of Chicago Steppin",
    excerpt: "Explore the deep cultural roots and evolution of Chicago Steppin from its origins in the 1970s to modern day.",
    featuredImage: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80", // Vintage dance couples, historical
    category: "HISTORY",
    authorName: "James Thompson",
    authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    publishedAt: "2025-10-01T10:00:00Z",
    readTime: 8,
    isFeatured: true,
  },
  {
    id: "article_002",
    slug: "top-10-steppin-events-2025",
    title: "Top 10 Steppin Events Coming to Chicago in 2025",
    excerpt: "Don't miss these incredible steppin events happening throughout the year. Mark your calendars now!",
    featuredImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80", // Event calendar planning
    category: "EVENTS",
    authorName: "Michelle Davis",
    authorPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    publishedAt: "2025-09-28T14:30:00Z",
    readTime: 6,
    isFeatured: true,
  },
  {
    id: "article_003",
    slug: "steppin-fashion-trends",
    title: "Steppin Fashion: What to Wear on the Dance Floor",
    excerpt: "Style tips and trends for looking your best while steppin. From classic elegance to modern flair.",
    featuredImage: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80", // Elegant fashion formal wear
    category: "FASHION",
    authorName: "Tasha Williams",
    authorPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    publishedAt: "2025-09-25T12:00:00Z",
    readTime: 5,
    isFeatured: false,
  },
  {
    id: "article_004",
    slug: "beginner-steppin-guide",
    title: "Complete Beginner's Guide to Chicago Steppin",
    excerpt: "New to steppin? Start here! Everything you need to know to get started with this beautiful dance.",
    featuredImage: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80", // Dance workshop group class
    category: "TUTORIALS",
    authorName: "Marcus Johnson",
    authorPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    publishedAt: "2025-09-20T09:00:00Z",
    readTime: 12,
    isFeatured: false,
  },
];

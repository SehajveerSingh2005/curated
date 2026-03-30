export interface WardrobeItem {
  _id: string;
  name: string;
  category: 'shirt' | 'pants' | 'shoes' | 'jacket' | 'dress' | 'accessory' | 'other';
  tags: string[];
  imageUrl: string;
  color?: string;
  forSale?: boolean;
}

export interface OutfitItem {
  item: WardrobeItem;
}

export interface Outfit {
  _id: string;
  items: WardrobeItem[];
  explanation: string;
  occasion?: string;
  createdAt: string;
}

export interface InspirationPost {
  _id: string;
  imageUrl: string;
  tags: string[];
  title?: string;
  author?: string;
}

export interface Product {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  tags: string[];
  seller?: string;
  condition?: 'new' | 'like new' | 'good' | 'fair';
}

export interface WardrobeItem {
  _id: string;
  name: string;
  category: 'shirt' | 't-shirt' | 'polo' | 'knitwear' | 'pants' | 'outerwear' | 'jacket' | 'dress' | 'shoes' | 'accessory' | 'other';
  tags: string[];
  imageUrl: string;
  cloudinaryPublicId?: string;
  color?: string;
  brand?: string;
  fabric?: string;
  forSale?: boolean;
  createdAt?: string;
}

export interface OutfitItem {
  item: WardrobeItem;
}

export interface Outfit {
  _id: string;
  name?: string;
  items: WardrobeItem[];
  explanation?: string;
  occasion?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: string;
}

export interface InspirationPost {
  _id: string;
  imageUrl: string;
  tags: string[];
  title?: string;
  author?: string;
  link?: string;
  source?: string;
  pubDate?: string;
}

export interface Product {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  tags: string[];
  seller?: {
    _id: string;
    username: string;
  };
  buyer?: {
    _id: string;
    username: string;
  };
  condition?: 'new' | 'like new' | 'good' | 'fair';
  status?: 'available' | 'sold';
  wardrobeItemId?: string;
  createdAt?: string;
  brand?: string;
  fabric?: string;
  color?: string;
}

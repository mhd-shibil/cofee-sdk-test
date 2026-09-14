export interface Product {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

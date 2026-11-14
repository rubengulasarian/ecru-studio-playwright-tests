/** Stable products of the ÉCRU catalog used by the tests (ids are generated deterministically by the site). */
export const CATALOG_SIZE = 132;

export const PRODUCT = {
  /** Linen Shirt — Ecru, $67 (below the $80 free-shipping threshold). */
  affordable: { id: 1, name: /Linen Shirt/, category: 'Shirts', price: 67 },
  /** Linen Shirt — Stone, $82 (above the free-shipping threshold). */
  aboveFreeShipping: { id: 3, name: /Linen Shirt/, category: 'Shirts', price: 82 },
  /** Product that is shown with a "Sale" tag and an old price. */
  onSale: { id: 9 },
  /** First Trousers item: its image file is intentionally missing (defect V3). */
  brokenImage: { id: 73 },
} as const;

export const CATEGORY_SIZES: Record<string, number> = {
  Shirts: 15,
  'T-Shirts': 15,
  Knitwear: 15,
  Outerwear: 15,
  Jeans: 12,
  Trousers: 12,
  Skirts: 12,
  Dresses: 12,
  Shorts: 9,
  Accessories: 15,
};

export const FREE_SHIPPING_FROM = 80;
export const SHIPPING_FEE = 8;
export const PROMO_CODE = 'SALE10';

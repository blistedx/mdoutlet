export const DAIRY_CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: '🥛', description: 'All dairy items' },
  { id: 'milk', label: 'Milk (Packaged & Pouch)', icon: '🥛', description: 'Full cream, toned, double-toned, cow, buffalo milk' },
  { id: 'raw-milk', label: 'Raw Farm Milk', icon: '🪣', description: 'Direct farmer procurement & bulk raw milk' },
  { id: 'curd', label: 'Curd & Dahi / Yogurt', icon: '🥣', description: 'Plain dahi, probiotic curd, mishti doi, Greek yogurt' },
  { id: 'paneer', label: 'Paneer & Cottage Cheese', icon: '🧀', description: 'Fresh malai paneer, low fat paneer, masala paneer' },
  { id: 'ghee', label: 'Desi Ghee & Clarified Butter', icon: '🫙', description: 'Cow ghee, buffalo ghee, danedar ghee, A2 ghee' },
  { id: 'butter', label: 'Butter & Makkhan', icon: '🧈', description: 'Table butter, white desi makkhan, unsalted butter' },
  { id: 'cream', label: 'Fresh Cream & Malai', icon: '🍶', description: 'Fresh heavy whipping cream, cooking cream, malai' },
  { id: 'cheese', label: 'Cheese & Mozzarella', icon: '🧀', description: 'Cheese slices, mozzarella, cheese blocks, cheese spread' },
  { id: 'buttermilk', label: 'Chaas, Lassi & Mattha', icon: '🥤', description: 'Spiced buttermilk, sweet lassi, mango lassi, mattha' },
  { id: 'sweets', label: 'Dairy Sweets & Mithai', icon: '🍬', description: 'Rasgulla, Gulab Jamun, Rasmalai, Peda, Barfi, Sandesh' },
  { id: 'khoya', label: 'Khoya / Mawa & Solids', icon: '🥟', description: 'Dhab, Batti, Pindi mawa, chenna, evaporated milk solids' },
  { id: 'beverages', label: 'Flavored Milk & Shakes', icon: '🧃', description: 'Badam milk, chocolate milk, cold coffee, milkshakes' },
  { id: 'ice-cream', label: 'Ice Cream & Kulfi', icon: '🍦', description: 'Matka kulfi, ice cream tubs, stick kulfi, cassata' },
  { id: 'dairy-powder', label: 'Milk Powder & Condensed Milk', icon: '📦', description: 'Skimmed milk powder (SMP), dairy whitener, condensed milk' },
  { id: 'whey-protein', label: 'Whey & Protein Drinks', icon: '💪', description: 'Liquid whey, whey protein isolate, colostrum/khees' },
  { id: 'spreads', label: 'Dairy Spreads & Dips', icon: '🍞', description: 'Garlic butter spread, cheese dip, sweet dairy spreads' },
  { id: 'cattle-feed', label: 'Cattle Feed & Farm Supplies', icon: '🌾', description: 'Khal, churi, mineral mixtures, dairy supplements' },
  { id: 'other', label: 'Other Dairy Allied Items', icon: '🏷️', description: 'Miscellaneous dairy & packaging products' }
];

export const CATEGORY_IDS = DAIRY_CATEGORIES.map((c) => c.id);
export const PRODUCT_CATEGORIES = DAIRY_CATEGORIES.filter((c) => c.id !== 'All');

export const MEASUREMENT_UNITS = [
  { id: 'litre', label: 'Litre (L)' },
  { id: 'ml', label: 'Millilitre (ml)' },
  { id: 'kg', label: 'Kilogram (kg)' },
  { id: 'gm', label: 'Gram (g)' },
  { id: 'packet', label: 'Packet / Pouch' },
  { id: 'can', label: 'Milk Can' },
  { id: 'box', label: 'Box / Carton' },
  { id: 'piece', label: 'Piece' },
  { id: 'bottle', label: 'Bottle' },
  { id: 'jar', label: 'Jar' },
  { id: 'tin', label: 'Tin' },
  { id: 'cup', label: 'Cup' },
  { id: 'pouch', label: 'Pouch' }
];

export const getCategoryMeta = (categoryId) => {
  return DAIRY_CATEGORIES.find((c) => c.id === categoryId) || {
    id: categoryId,
    label: categoryId,
    icon: '🥛',
    description: ''
  };
};

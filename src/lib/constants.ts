// Contact details (phone, WhatsApp, email, address, hours, socials) are editable
// store settings — see DEFAULT_SETTINGS in lib/settings.ts.
export const SITE = {
  name: "Balincia",
  tagline: "Maison de Parfum",
  description:
    "Balincia crafts long-lasting, super-macerated perfumes, attars and home fragrances in Pakistan — composed with rare oils and delivered nationwide.",
};

/** httpOnly cookie that lets a guest view the confirmation page of the order they just placed. */
export const LAST_ORDER_COOKIE = "blc_last_order";

export const GENDERS = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "UNISEX", label: "Unisex" },
] as const;

export const FAMILIES = [
  { value: "woody", label: "Woody" },
  { value: "oud", label: "Oud" },
  { value: "floral", label: "Floral" },
  { value: "fresh", label: "Fresh" },
  { value: "citrus", label: "Citrus" },
  { value: "oriental", label: "Oriental" },
  { value: "gourmand", label: "Gourmand" },
  { value: "spicy", label: "Spicy" },
  { value: "aquatic", label: "Aquatic" },
  { value: "fruity", label: "Fruity" },
] as const;

export const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
] as const;

export const GENRES = [
  { value: "ARABIC", label: "Arabic" },
  { value: "FRENCH", label: "French" },
  { value: "WESTERN", label: "Western" },
  { value: "EASTERN", label: "Eastern" },
] as const;

export const OCCASIONS = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" },
  { value: "office", label: "Office" },
  { value: "evening", label: "Evening" },
  { value: "signature", label: "Signature" },
] as const;

export const CONCENTRATIONS = [
  { value: "EDP", label: "Eau de Parfum" },
  { value: "EDT", label: "Eau de Toilette" },
  { value: "EXTRAIT", label: "Extrait de Parfum" },
  { value: "PARFUM", label: "Parfum" },
  { value: "ATTAR", label: "Attar (oil)" },
  { value: "MIST", label: "Body Mist" },
  { value: "HOME", label: "Home Fragrance" },
  { value: "SET", label: "Gift / Sample Set" },
] as const;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const;

export const BOTTLE_SHAPES = ["classic", "round", "tall", "attar", "box", "diffuser", "candle", "mist"] as const;

export const PERFORMANCE_LABELS: Record<number, string> = {
  1: "Intimate",
  2: "Soft",
  3: "Moderate",
  4: "Strong",
  5: "Beast mode",
};

export const LONGEVITY_LABELS: Record<number, string> = {
  1: "2 – 3 hrs",
  2: "4 – 5 hrs",
  3: "6 – 8 hrs",
  4: "8 – 12 hrs",
  5: "12+ hrs",
};

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_META: Record<string, { label: string; tone: string; description: string }> = {
  PENDING: { label: "Order placed", tone: "amber", description: "We have received your order." },
  CONFIRMED: { label: "Confirmed", tone: "sky", description: "Your order has been confirmed by our team." },
  PROCESSING: { label: "Being prepared", tone: "violet", description: "Your fragrances are being packed with care." },
  SHIPPED: { label: "Shipped", tone: "indigo", description: "Your parcel is on its way." },
  DELIVERED: { label: "Delivered", tone: "emerald", description: "Delivered. Enjoy your new scent!" },
  CANCELLED: { label: "Cancelled", tone: "rose", description: "This order has been cancelled." },
};

export const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery", description: "Pay in cash when your parcel arrives." },
  { value: "BANK", label: "Bank Transfer", description: "Transfer to our bank account — details shared after checkout." },
  { value: "WALLET", label: "JazzCash / Easypaisa", description: "Send to our mobile wallet and share the transaction ID." },
] as const;

export const PAYMENT_STATUSES = ["PENDING", "PAID", "REFUNDED"] as const;

export const PROVINCES = [
  "Sindh",
  "Punjab",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
] as const;

export const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
  "Gujranwala",
  "Bahawalpur",
  "Sukkur",
  "Abbottabad",
  "Sargodha",
  "Mardan",
  "Larkana",
  "Gilgit",
  "Muzaffarabad",
] as const;

export const STORES = [
  {
    city: "Karachi",
    name: "Flagship Atelier — Dolmen Mall Clifton",
    address: "Ground Floor, Dolmen Mall, Block 4 Clifton, Karachi",
    phone: "+92 21 3529 0000",
    hours: "11am – 10pm",
  },
  {
    city: "Karachi",
    name: "LuckyOne Mall",
    address: "First Floor, LuckyOne Mall, Rashid Minhas Road, Karachi",
    phone: "+92 21 3630 0000",
    hours: "11am – 10pm",
  },
  {
    city: "Lahore",
    name: "Emporium Mall",
    address: "Ground Floor, Emporium Mall, Johar Town, Lahore",
    phone: "+92 42 3531 0000",
    hours: "11am – 10pm",
  },
  {
    city: "Lahore",
    name: "MM Alam Road Boutique",
    address: "Shop 12, MM Alam Road, Gulberg III, Lahore",
    phone: "+92 42 3575 0000",
    hours: "12pm – 11pm",
  },
  {
    city: "Islamabad",
    name: "Centaurus Mall",
    address: "Level 2, The Centaurus, F-8, Islamabad",
    phone: "+92 51 2155 0000",
    hours: "11am – 10pm",
  },
  {
    city: "Faisalabad",
    name: "Lyallpur Galleria",
    address: "Ground Floor, Lyallpur Galleria, Canal Road, Faisalabad",
    phone: "+92 41 8500 000",
    hours: "11am – 10pm",
  },
  {
    city: "Multan",
    name: "Mall of Multan",
    address: "First Floor, Mall of Multan, Bosan Road, Multan",
    phone: "+92 61 6500 000",
    hours: "11am – 10pm",
  },
  {
    city: "Peshawar",
    name: "Deans Trade Centre",
    address: "Ground Floor, Deans Trade Centre, Saddar, Peshawar",
    phone: "+92 91 5250 000",
    hours: "11am – 9pm",
  },
];

/** Virtual collections that are computed rather than stored as categories. */
export const VIRTUAL_COLLECTIONS: Record<string, { name: string; description: string; palette: string }> = {
  "best-sellers": {
    name: "Best Sellers",
    description: "The scents Pakistan keeps coming back to — our most-loved bottles, ranked by you.",
    palette: "#1f1a17,#c9a27a",
  },
  "new-arrivals": {
    name: "New Arrivals",
    description: "Fresh from the atelier. The newest compositions to join the Balincia library.",
    palette: "#20302b,#a7c4b5",
  },
  "under-2000": {
    name: "Under Rs. 2,000",
    description: "Big character, gentle price. Every scent here is under two thousand rupees.",
    palette: "#3a2a1c,#e2b07a",
  },
  oud: {
    name: "The Oud Edit",
    description: "Smoky, resinous and regal — compositions built around precious agarwood.",
    palette: "#1a0f0a,#8b5a2b",
  },
  sale: {
    name: "On Sale",
    description: "Limited-time prices on selected favourites. When they're gone, they're gone.",
    palette: "#3b1219,#e08a8a",
  },
  men: {
    name: "For Him",
    description: "Woody, spicy and commanding. Signature scents composed for men.",
    palette: "#141820,#7d8ca3",
  },
  women: {
    name: "For Her",
    description: "Florals, fruits and soft musks — luminous perfumes composed for women.",
    palette: "#3a1f2b,#e7b8c4",
  },
  unisex: {
    name: "Unisex",
    description: "Scents without rules. Compositions made to be shared, borrowed and claimed by anyone.",
    palette: "#2f2a24,#c8b59a",
  },
};

export type NavGroup = { title: string; links: { label: string; href: string }[] };
export type NavItem = { label: string; href: string; groups?: NavGroup[]; feature?: { title: string; href: string; palette: string } };

export const NAV: NavItem[] = [
  {
    label: "Shop",
    href: "/shop",
    groups: [
      {
        title: "For Him",
        links: [
          { label: "All Men's", href: "/collections/men" },
          { label: "Best Sellers", href: "/collections/men?sort=popular" },
          { label: "Woody & Oud", href: "/collections/men?family=woody" },
          { label: "Fresh & Aquatic", href: "/collections/men?family=fresh" },
          { label: "Office Ready", href: "/collections/men?occasion=office" },
          { label: "Long-lasting", href: "/collections/men?longevity=4" },
        ],
      },
      {
        title: "For Her",
        links: [
          { label: "All Women's", href: "/collections/women" },
          { label: "Best Sellers", href: "/collections/women?sort=popular" },
          { label: "Floral", href: "/collections/women?family=floral" },
          { label: "Fruity", href: "/collections/women?family=fruity" },
          { label: "Sweet & Gourmand", href: "/collections/women?family=gourmand" },
          { label: "Citrus", href: "/collections/women?family=citrus" },
        ],
      },
      {
        title: "By Season",
        links: [
          { label: "Summer", href: "/shop?season=summer" },
          { label: "Winter", href: "/shop?season=winter" },
          { label: "Spring", href: "/shop?season=spring" },
          { label: "Autumn", href: "/shop?season=autumn" },
        ],
      },
      {
        title: "By Genre",
        links: [
          { label: "Arabic", href: "/shop?genre=ARABIC" },
          { label: "French", href: "/shop?genre=FRENCH" },
          { label: "Western", href: "/shop?genre=WESTERN" },
          { label: "Eastern", href: "/shop?genre=EASTERN" },
          { label: "Unisex", href: "/collections/unisex" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "Attars", href: "/collections/attars" },
          { label: "Body Mists", href: "/collections/body-mists" },
          { label: "Home Fragrance", href: "/collections/home-fragrance" },
          { label: "New Arrivals", href: "/collections/new-arrivals" },
          { label: "On Sale", href: "/collections/sale" },
        ],
      },
    ],
    feature: { title: "Find your signature in 60 seconds", href: "/quiz", palette: "#1f1a17,#c9a27a" },
  },
  { label: "Gift Sets", href: "/collections/gift-sets" },
  { label: "Under 2000", href: "/collections/under-2000" },
  { label: "Oud", href: "/collections/oud" },
  { label: "Discovery Sets", href: "/collections/discovery-sets" },
  { label: "Attars", href: "/collections/attars" },
  { label: "Home", href: "/collections/home-fragrance" },
];

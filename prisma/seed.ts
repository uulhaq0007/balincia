/* Seeds the Balincia catalogue, demo accounts, orders, reviews, coupons and blog. Run: npm run db:seed */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Deterministic PRNG so every seed produces the same store.
let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

type V = { label: string; price: number; compareAtPrice?: number; stock?: number };
type P = {
  name: string;
  category: string;
  tagline: string;
  description: string;
  gender: "MEN" | "WOMEN" | "UNISEX";
  concentration: string;
  genre: string;
  top: string;
  heart: string;
  base: string;
  families: string;
  seasons: string;
  occasions: string;
  longevity: number;
  sillage: number;
  palette: string;
  shape: string;
  variants: V[];
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
};

const categories = [
  {
    slug: "signature",
    name: "Signature Collection",
    description: "Modern classics composed for everyday brilliance — the backbone of the Balincia library.",
    palette: "#2b2118,#c9a27a",
  },
  {
    slug: "diwan",
    name: "Diwan Collection",
    description: "Compositions inspired by Urdu poetry and the landscapes of Pakistan — from Hunza mornings to Lahore nights.",
    palette: "#2a0f14,#c47a5a",
  },
  {
    slug: "noir",
    name: "Noir Collection",
    description: "Extrait de parfum at its most concentrated. Dark, opulent and built to last well past midnight.",
    palette: "#140c0a,#8b5a3a",
  },
  {
    slug: "attars",
    name: "Attars",
    description: "Alcohol-free perfume oils, hand-blended in the age-old tradition. A drop lasts all day.",
    palette: "#4a1a08,#e0a03a",
  },
  {
    slug: "gift-sets",
    name: "Gift Sets",
    description: "Beautifully boxed duos and trios — gifting made effortless for Eid, weddings and every celebration.",
    palette: "#2a1a10,#d4a373",
  },
  {
    slug: "discovery-sets",
    name: "Discovery Sets",
    description: "Not sure yet? Sample our best-loved scents in travel minis before committing to a full bottle.",
    palette: "#3a2a1c,#e8d5b5",
  },
  {
    slug: "body-mists",
    name: "Body Mists",
    description: "Light, playful layers of scent for hair and body. Spritz generously, refresh often.",
    palette: "#a04a6a,#f8cfe0",
  },
  {
    slug: "home-fragrance",
    name: "Home Fragrance",
    description: "Reed diffusers, candles and car scents — bring the Balincia signature into every space you love.",
    palette: "#4a3a20,#d9c08a",
  },
];

const edp = (p50: number, p100: number, c50?: number, c100?: number): V[] => [
  { label: "50ml", price: p50, compareAtPrice: c50 },
  { label: "100ml", price: p100, compareAtPrice: c100 },
];
const attar = (p8: number, p12: number): V[] => [
  { label: "8ml", price: p8 },
  { label: "12ml", price: p12 },
];

const products: P[] = [
  // ——— Signature ———
  {
    name: "Saffron Dusk",
    category: "signature",
    tagline: "Saffron, rose & smouldering amber",
    description:
      "Saffron Dusk opens like the last golden light over the Arabian Sea — a crackle of saffron and pink pepper giving way to a velvety heart of rose and supple leather. As the evening deepens, warm amber, resinous oud and a whisper of vanilla wrap the skin for hours.",
    gender: "MEN",
    concentration: "EDP",
    genre: "ARABIC",
    top: "Saffron, Pink Pepper, Bergamot",
    heart: "Rose, Leather",
    base: "Amber, Oud, Vanilla",
    families: "oriental,spicy,oud",
    seasons: "autumn,winter",
    occasions: "night,evening,signature",
    longevity: 5,
    sillage: 4,
    palette: "#3b1d12,#d08a4a",
    shape: "classic",
    variants: edp(2490, 3990),
    featured: true,
    bestseller: true,
  },
  {
    name: "Citrus Lagoon",
    category: "signature",
    tagline: "Lemon zest, mint & sea salt",
    description:
      "A cold plunge in a bottle. Citrus Lagoon bursts with lemon, grapefruit and crushed mint before settling into a breezy heart of sea salt and lavender, grounded by clean cedar and skin musk. The answer to a Karachi summer afternoon.",
    gender: "MEN",
    concentration: "EDP",
    genre: "WESTERN",
    top: "Lemon, Grapefruit, Mint",
    heart: "Sea Salt, Lavender",
    base: "Cedarwood, Musk",
    families: "fresh,citrus,aquatic",
    seasons: "spring,summer",
    occasions: "day,office",
    longevity: 3,
    sillage: 3,
    palette: "#12384a,#7cc6d6",
    shape: "tall",
    variants: edp(1890, 2890),
    bestseller: true,
  },
  {
    name: "Velvet Rose",
    category: "signature",
    tagline: "Turkish rose, lychee & patchouli",
    description:
      "Velvet Rose is a modern chypre-rose with a sense of humour: juicy lychee and raspberry tumble over a lush bouquet of Turkish rose and peony, while earthy patchouli and white musk keep it grown-up. Romantic, never sugary.",
    gender: "WOMEN",
    concentration: "EDP",
    genre: "FRENCH",
    top: "Lychee, Raspberry",
    heart: "Turkish Rose, Peony",
    base: "Patchouli, White Musk",
    families: "floral,fruity",
    seasons: "spring,autumn",
    occasions: "evening,signature",
    longevity: 4,
    sillage: 3,
    palette: "#5a1a2c,#e9a3b5",
    shape: "round",
    variants: edp(2290, 3490),
    featured: true,
    bestseller: true,
  },
  {
    name: "Morning Linen",
    category: "signature",
    tagline: "Clean cotton, pear & white musk",
    description:
      "The scent of sun-dried sheets and the first chai of the day. Sparkling aldehydes and crisp pear lead into soft cotton flower and powdery iris, finishing on a cocoon of white musk and ambrette. Quietly addictive.",
    gender: "UNISEX",
    concentration: "EDP",
    genre: "WESTERN",
    top: "Aldehydes, Pear",
    heart: "Cotton Flower, Iris",
    base: "White Musk, Ambrette",
    families: "fresh,floral",
    seasons: "spring,summer",
    occasions: "day,office",
    longevity: 3,
    sillage: 2,
    palette: "#6b7b86,#e6eef0",
    shape: "tall",
    variants: edp(1790, 2690),
    isNew: true,
  },
  {
    name: "Midnight Tobacco",
    category: "signature",
    tagline: "Tobacco leaf, rum & tonka",
    description:
      "Dark, boozy and impossibly smooth. Cardamom and a splash of spiced rum introduce honeyed tobacco leaf and cinnamon bark, while tonka bean, vanilla and dry cedar linger like conversation after midnight.",
    gender: "MEN",
    concentration: "EDP",
    genre: "WESTERN",
    top: "Cardamom, Rum",
    heart: "Tobacco Leaf, Cinnamon",
    base: "Tonka Bean, Vanilla, Cedar",
    families: "gourmand,spicy,woody",
    seasons: "autumn,winter",
    occasions: "night,evening",
    longevity: 5,
    sillage: 4,
    palette: "#2a1a10,#b07a46",
    shape: "classic",
    variants: edp(2690, 4290),
    featured: true,
  },
  {
    name: "Jasmine Monsoon",
    category: "signature",
    tagline: "Motia, green mandarin & rain",
    description:
      "Inspired by garlands of motia sold at traffic signals after the first rain. Green mandarin and a dewy rain accord open onto an intoxicating heart of jasmine sambac, resting on creamy sandalwood and musk.",
    gender: "WOMEN",
    concentration: "EDP",
    genre: "EASTERN",
    top: "Green Mandarin, Rain Accord",
    heart: "Jasmine Sambac, Motia",
    base: "Sandalwood, Musk",
    families: "floral,fresh",
    seasons: "spring,summer",
    occasions: "day,signature",
    longevity: 4,
    sillage: 3,
    palette: "#3d5a48,#f1ead2",
    shape: "round",
    variants: edp(1990, 2990),
    isNew: true,
  },
  {
    name: "Vetiver Coast",
    category: "signature",
    tagline: "Vetiver, ginger & ambroxan",
    description:
      "Effortless, polished and quietly confident. Bergamot and fresh ginger lift a heart of smoky Haitian vetiver and geranium, while cedar and ambroxan give it a radiant, skin-close trail that works from boardroom to beach.",
    gender: "MEN",
    concentration: "EDP",
    genre: "FRENCH",
    top: "Bergamot, Ginger",
    heart: "Vetiver, Geranium",
    base: "Cedarwood, Ambroxan",
    families: "woody,fresh",
    seasons: "spring,summer,autumn",
    occasions: "office,day",
    longevity: 4,
    sillage: 3,
    palette: "#2e3b2a,#a9b98a",
    shape: "tall",
    variants: edp(2190, 3290),
  },
  {
    name: "Amber Reverie",
    category: "signature",
    tagline: "Golden amber, benzoin & vanilla",
    description:
      "A cashmere blanket of a fragrance. Orange blossom glows over labdanum and benzoin, melting into a long, sweet-resinous drydown of amber, vanilla and musk. Worn by everyone, owned by no one.",
    gender: "UNISEX",
    concentration: "EDP",
    genre: "ARABIC",
    top: "Orange Blossom",
    heart: "Labdanum, Benzoin",
    base: "Amber, Vanilla, Musk",
    families: "oriental,gourmand",
    seasons: "autumn,winter",
    occasions: "evening,signature",
    longevity: 5,
    sillage: 4,
    palette: "#4a2412,#e7a65a",
    shape: "round",
    variants: edp(2390, 3790),
    bestseller: true,
  },
  {
    name: "Peach Chiffon",
    category: "signature",
    tagline: "Peach, freesia & praline",
    description:
      "Light as chiffon, sweet as a summer orchard. Velvety peach and pear sparkle with bergamot, a heart of freesia and magnolia keeps it airy, and a soft praline-vanilla base makes it dangerously huggable.",
    gender: "WOMEN",
    concentration: "EDP",
    genre: "WESTERN",
    top: "Peach, Pear, Bergamot",
    heart: "Freesia, Magnolia",
    base: "Vanilla, Praline",
    families: "fruity,gourmand,floral",
    seasons: "spring,summer",
    occasions: "day",
    longevity: 3,
    sillage: 3,
    palette: "#8a4a3a,#f6c6a8",
    shape: "round",
    variants: edp(1690, 2490, 1990, 2890),
  },
  {
    name: "Boardroom",
    category: "signature",
    tagline: "Grapefruit, iris & polished leather",
    description:
      "The scent of a decision well made. Grapefruit and black pepper give an energetic, clean start; lavender and iris add tailored elegance; vetiver and fine leather close the deal. Built for the office, remembered after.",
    gender: "MEN",
    concentration: "EDP",
    genre: "WESTERN",
    top: "Grapefruit, Black Pepper",
    heart: "Lavender, Iris",
    base: "Vetiver, Leather",
    families: "woody,spicy,fresh",
    seasons: "spring,summer,autumn,winter",
    occasions: "office,signature",
    longevity: 4,
    sillage: 3,
    palette: "#1c2230,#8d9bb0",
    shape: "classic",
    variants: edp(2490, 3690),
    featured: true,
    bestseller: true,
  },
  {
    name: "Mughal Garden",
    category: "signature",
    tagline: "Damask rose, pomegranate & oud",
    description:
      "An evening stroll through terraced gardens and marble fountains. Saffron and ruby pomegranate open onto damask rose and jasmine, deepening into a regal base of oud and sandalwood. Wedding-season royalty.",
    gender: "WOMEN",
    concentration: "EDP",
    genre: "EASTERN",
    top: "Saffron, Pomegranate",
    heart: "Damask Rose, Jasmine",
    base: "Oud, Sandalwood",
    families: "floral,oriental,oud",
    seasons: "autumn,winter",
    occasions: "evening,signature",
    longevity: 5,
    sillage: 4,
    palette: "#4a1430,#d77a9a",
    shape: "classic",
    variants: edp(2590, 3990),
  },
  // ——— Diwan ———
  {
    name: "Hunza Morning",
    category: "diwan",
    tagline: "Apricot, chamomile & mountain air",
    description:
      "Cherry-blossom valleys, glacial streams and apricots drying on rooftops. Hunza Morning pairs sun-ripened apricot and green apple with a crisp mountain-air accord, softened by chamomile and violet leaf over cedar and moss.",
    gender: "UNISEX",
    concentration: "EDP",
    genre: "EASTERN",
    top: "Apricot, Green Apple, Mountain Air",
    heart: "Chamomile, Violet Leaf",
    base: "Cedarwood, Oakmoss",
    families: "fresh,fruity,woody",
    seasons: "spring,summer",
    occasions: "day",
    longevity: 3,
    sillage: 2,
    palette: "#2d4b52,#f2c48a",
    shape: "tall",
    variants: edp(1890, 2790),
    isNew: true,
  },
  {
    name: "Lahore Nights",
    category: "diwan",
    tagline: "Cardamom, incense & oud",
    description:
      "Old-city lanes lit by lanterns, cardamom chai and incense drifting from a shrine. Lahore Nights is bold and unapologetic: spiced saffron, rose and frankincense over a smoky trail of oud, amber and leather.",
    gender: "MEN",
    concentration: "EDP",
    genre: "EASTERN",
    top: "Cardamom, Saffron",
    heart: "Rose, Frankincense",
    base: "Oud, Amber, Leather",
    families: "oriental,spicy,oud",
    seasons: "autumn,winter",
    occasions: "night,evening",
    longevity: 5,
    sillage: 5,
    palette: "#2a0f14,#b44a3c",
    shape: "classic",
    variants: edp(2790, 4490),
    featured: true,
    bestseller: true,
  },
  {
    name: "Karachi Breeze",
    category: "diwan",
    tagline: "Sea salt, lime & driftwood",
    description:
      "Clifton at sunset — salty air, sizzling street food and a cool wind off the water. Lime and sea salt sparkle over neroli and clary sage, finished with sun-bleached driftwood and musk.",
    gender: "MEN",
    concentration: "EDT",
    genre: "EASTERN",
    top: "Sea Salt, Lime",
    heart: "Neroli, Clary Sage",
    base: "Driftwood, Musk",
    families: "aquatic,fresh,citrus",
    seasons: "spring,summer",
    occasions: "day,office",
    longevity: 3,
    sillage: 3,
    palette: "#0f3b57,#a6d8e8",
    shape: "tall",
    variants: edp(1590, 2390),
    bestseller: true,
  },
  {
    name: "Ghazal",
    category: "diwan",
    tagline: "Tuberose, orange blossom & sandalwood",
    description:
      "A love poem recited in candlelight. Bergamot and pink pepper flirt with an opulent heart of tuberose and orange blossom, resolving into creamy sandalwood, vanilla and musk. Sensual, lyrical, unforgettable.",
    gender: "WOMEN",
    concentration: "EDP",
    genre: "EASTERN",
    top: "Bergamot, Pink Pepper",
    heart: "Tuberose, Orange Blossom",
    base: "Sandalwood, Vanilla, Musk",
    families: "floral,oriental",
    seasons: "spring,autumn,winter",
    occasions: "evening,signature",
    longevity: 4,
    sillage: 3,
    palette: "#3d1f3a,#d9a8d0",
    shape: "round",
    variants: edp(2190, 3290),
    featured: true,
  },
  {
    name: "Monsoon Mitti",
    category: "diwan",
    tagline: "Petrichor, vetiver & sandalwood",
    description:
      "That first breath of rain on parched earth, captured. A petrichor accord and crushed green leaves open onto vetiver and a mineral clay note, drying down to soft sandalwood and musk. Nostalgia you can wear.",
    gender: "UNISEX",
    concentration: "EDP",
    genre: "EASTERN",
    top: "Petrichor, Green Leaves",
    heart: "Vetiver, Clay Accord",
    base: "Sandalwood, Musk",
    families: "woody,fresh",
    seasons: "summer,autumn",
    occasions: "day,signature",
    longevity: 3,
    sillage: 3,
    palette: "#4a3a2a,#bfa07a",
    shape: "tall",
    variants: edp(1990, 2990),
  },
  {
    name: "Qissa",
    category: "diwan",
    tagline: "Black pepper, cedar & oud",
    description:
      "Every great story has a little smoke in it. Lemon and black pepper sharpen the opening, cedar and geranium carry the plot, and a finale of oud and patchouli leaves you wanting another chapter.",
    gender: "MEN",
    concentration: "EDP",
    genre: "EASTERN",
    top: "Lemon, Black Pepper",
    heart: "Cedarwood, Geranium",
    base: "Oud, Patchouli",
    families: "woody,oud,spicy",
    seasons: "autumn,winter",
    occasions: "evening",
    longevity: 4,
    sillage: 4,
    palette: "#2b1c14,#9c7b5a",
    shape: "classic",
    variants: edp(2290, 3490, undefined, 3990),
  },
  // ——— Noir ———
  {
    name: "Noir Oud Royale",
    category: "noir",
    tagline: "Rare oud, saffron & raspberry",
    description:
      "Our most precious composition. A jewel-bright opening of saffron and raspberry gives way to rose absolute and genuine Cambodian oud, with amber, patchouli and leather lingering for well over twelve hours.",
    gender: "UNISEX",
    concentration: "EXTRAIT",
    genre: "ARABIC",
    top: "Saffron, Raspberry",
    heart: "Rose Absolute, Cambodian Oud",
    base: "Amber, Patchouli, Leather",
    families: "oud,oriental",
    seasons: "autumn,winter",
    occasions: "night,signature",
    longevity: 5,
    sillage: 5,
    palette: "#1a0a08,#8b3a2a",
    shape: "tall",
    variants: edp(5490, 8990),
    featured: true,
    bestseller: true,
  },
  {
    name: "Obsidian Iris",
    category: "noir",
    tagline: "Black iris, incense & suede",
    description:
      "Mysterious and couture. Black currant and mandarin shimmer over a dark floral heart of iris and orchid, sinking into smoky incense, vanilla and soft suede. For nights that end at sunrise.",
    gender: "WOMEN",
    concentration: "EXTRAIT",
    genre: "FRENCH",
    top: "Black Currant, Mandarin",
    heart: "Iris, Orchid",
    base: "Incense, Vanilla, Suede",
    families: "floral,oriental",
    seasons: "autumn,winter",
    occasions: "night",
    longevity: 5,
    sillage: 4,
    palette: "#1d1428,#8a6aa8",
    shape: "classic",
    variants: edp(4490, 6990),
    isNew: true,
  },
  {
    name: "Cuir Sauvage",
    category: "noir",
    tagline: "Birch tar, leather & ambergris",
    description:
      "Untamed and magnetic. Smoky birch tar and bergamot crack open a heart of raw leather and iris, while vetiver and mineral ambergris leave a trail that turns heads in every room.",
    gender: "MEN",
    concentration: "EXTRAIT",
    genre: "FRENCH",
    top: "Bergamot, Birch Tar",
    heart: "Leather, Iris",
    base: "Vetiver, Ambergris",
    families: "woody,spicy",
    seasons: "autumn,winter",
    occasions: "evening,night",
    longevity: 5,
    sillage: 4,
    palette: "#1a1512,#7a5a44",
    shape: "classic",
    variants: edp(4290, 6590),
  },
  {
    name: "Ambre Imperial",
    category: "noir",
    tagline: "Plum, cinnamon & golden oud",
    description:
      "Opulence, distilled. Spiced cinnamon and dark plum melt into a heart of amber and rose, crowned with vanilla, benzoin and oud. Rich enough for Eid, a shaadi, or simply because you can.",
    gender: "UNISEX",
    concentration: "EXTRAIT",
    genre: "ARABIC",
    top: "Cinnamon, Plum",
    heart: "Amber, Rose",
    base: "Vanilla, Oud, Benzoin",
    families: "oriental,gourmand,oud",
    seasons: "winter",
    occasions: "night,signature",
    longevity: 5,
    sillage: 5,
    palette: "#3a1206,#d9822b",
    shape: "round",
    variants: edp(4990, 7990, 5690),
  },
  // ——— Attars ———
  {
    name: "Kesar Oud Attar",
    category: "attars",
    tagline: "Saffron, oud & amber oil",
    description:
      "A traditional concentrated perfume oil: Kashmiri saffron and aged oud blended with amber. Alcohol-free and skin-friendly — one drop on the pulse points lasts all day.",
    gender: "UNISEX",
    concentration: "ATTAR",
    genre: "ARABIC",
    top: "Saffron",
    heart: "Oud",
    base: "Amber",
    families: "oud,oriental,spicy",
    seasons: "autumn,winter",
    occasions: "signature,evening",
    longevity: 5,
    sillage: 3,
    palette: "#4a1a08,#e0a03a",
    shape: "attar",
    variants: attar(1790, 2490),
    bestseller: true,
  },
  {
    name: "Mitti Attar",
    category: "attars",
    tagline: "Rain-soaked earth & vetiver",
    description:
      "The classic Indian-subcontinent attar of baked earth, distilled after the first rains. Vetiver and sandalwood make it calming, grounding and deeply nostalgic.",
    gender: "UNISEX",
    concentration: "ATTAR",
    genre: "EASTERN",
    top: "Petrichor",
    heart: "Vetiver",
    base: "Sandalwood",
    families: "woody,fresh",
    seasons: "summer,autumn",
    occasions: "day,signature",
    longevity: 4,
    sillage: 2,
    palette: "#5a4632,#c9ab84",
    shape: "attar",
    variants: attar(1450, 1990),
  },
  {
    name: "Gul-e-Rana Attar",
    category: "attars",
    tagline: "Rose, saffron & musk oil",
    description:
      "Pure rose oil warmed with a touch of saffron and softened with musk — the kind of attar grandmothers kept in velvet boxes. Elegant, timeless and endlessly wearable.",
    gender: "WOMEN",
    concentration: "ATTAR",
    genre: "EASTERN",
    top: "Rose",
    heart: "Saffron",
    base: "Musk",
    families: "floral",
    seasons: "spring,autumn,winter",
    occasions: "signature,evening",
    longevity: 4,
    sillage: 2,
    palette: "#6a1a2a,#e78a9a",
    shape: "attar",
    variants: attar(1590, 2190),
  },
  {
    name: "Musk Tahara Attar",
    category: "attars",
    tagline: "White musk, powder & rose",
    description:
      "Clean, creamy white musk with soft powdery rose — the beloved 'musk of purity'. Gentle enough for daily prayers, office hours and everything in between.",
    gender: "UNISEX",
    concentration: "ATTAR",
    genre: "ARABIC",
    top: "Powder",
    heart: "Rose",
    base: "White Musk",
    families: "fresh,floral",
    seasons: "spring,summer,autumn,winter",
    occasions: "day,office",
    longevity: 4,
    sillage: 2,
    palette: "#5c5a66,#f1e6ee",
    shape: "attar",
    variants: attar(1290, 1790),
  },
  {
    name: "Shamama Attar",
    category: "attars",
    tagline: "Herbal spices, oud & amber",
    description:
      "One of the most complex traditional attars: dozens of herbs, spices and flowers slow-cooked into a base of oud and amber. Dark, earthy and wonderfully warming in winter.",
    gender: "MEN",
    concentration: "ATTAR",
    genre: "EASTERN",
    top: "Herbs, Spices",
    heart: "Oud",
    base: "Amber",
    families: "spicy,oriental,oud",
    seasons: "winter",
    occasions: "evening,signature",
    longevity: 5,
    sillage: 3,
    palette: "#3a1a0a,#b06a2a",
    shape: "attar",
    variants: attar(1990, 2790),
    isNew: true,
  },
  // ——— Gift Sets ———
  {
    name: "The Duo — Him & Her",
    category: "gift-sets",
    tagline: "Saffron Dusk + Velvet Rose, 50ml each",
    description:
      "Two of our most-loved signatures, presented in a keepsake box with a satin ribbon and handwritten card. The perfect anniversary, wedding or Eid gift for a couple.",
    gender: "UNISEX",
    concentration: "SET",
    genre: "WESTERN",
    top: "Saffron, Lychee",
    heart: "Rose, Leather",
    base: "Amber, Patchouli",
    families: "oriental,floral",
    seasons: "spring,summer,autumn,winter",
    occasions: "signature",
    longevity: 4,
    sillage: 4,
    palette: "#2a1a10,#d4a373",
    shape: "box",
    variants: [{ label: "2 x 50ml", price: 4290, compareAtPrice: 4780 }],
    featured: true,
    bestseller: true,
  },
  {
    name: "Oud Trilogy",
    category: "gift-sets",
    tagline: "Lahore Nights, Qissa & Noir Oud Royale — 30ml each",
    description:
      "A journey through oud in three acts — smoky, woody and regal. Presented in a black lacquered box for the oud connoisseur in your life.",
    gender: "UNISEX",
    concentration: "SET",
    genre: "ARABIC",
    top: "Saffron, Cardamom",
    heart: "Rose, Cedar",
    base: "Oud, Amber, Leather",
    families: "oud,oriental,woody",
    seasons: "autumn,winter",
    occasions: "signature,evening",
    longevity: 5,
    sillage: 5,
    palette: "#1a0a08,#b07a46",
    shape: "box",
    variants: [{ label: "3 x 30ml", price: 6490, compareAtPrice: 7470 }],
    featured: true,
  },
  {
    name: "The Executive Set",
    category: "gift-sets",
    tagline: "Boardroom 100ml + Vetiver Coast 50ml",
    description:
      "Day-to-night polish for the professional: Boardroom for the meetings, Vetiver Coast for the weekend. Includes a leather-look travel pouch.",
    gender: "MEN",
    concentration: "SET",
    genre: "WESTERN",
    top: "Grapefruit, Ginger",
    heart: "Iris, Vetiver",
    base: "Leather, Cedar",
    families: "woody,fresh",
    seasons: "spring,summer,autumn,winter",
    occasions: "office",
    longevity: 4,
    sillage: 3,
    palette: "#1c2230,#c9a27a",
    shape: "box",
    variants: [{ label: "100ml + 50ml", price: 5490, compareAtPrice: 5880 }],
  },
  {
    name: "Bloom Gift Box",
    category: "gift-sets",
    tagline: "Velvet Rose + Peach Chiffon, 50ml each",
    description:
      "A bouquet that never wilts. Two luminous florals boxed with dried rose petals — a sweet surprise for birthdays, mehndis and Mother's Day.",
    gender: "WOMEN",
    concentration: "SET",
    genre: "FRENCH",
    top: "Lychee, Peach",
    heart: "Rose, Freesia",
    base: "Musk, Praline",
    families: "floral,fruity",
    seasons: "spring,summer",
    occasions: "day,signature",
    longevity: 3,
    sillage: 3,
    palette: "#5a1a2c,#f2b8c6",
    shape: "box",
    variants: [{ label: "2 x 50ml", price: 3690, compareAtPrice: 3980 }],
  },
  // ——— Discovery ———
  {
    name: "Top 5 Discovery Set",
    category: "discovery-sets",
    tagline: "Five best-sellers in 5ml minis",
    description:
      "Saffron Dusk, Velvet Rose, Boardroom, Lahore Nights and Amber Reverie in travel-friendly 5ml sprays. Try them for a week — then claim your signature. Includes a Rs. 500 voucher towards a full bottle.",
    gender: "UNISEX",
    concentration: "SET",
    genre: "WESTERN",
    top: "Assorted",
    heart: "Assorted",
    base: "Assorted",
    families: "oriental,floral,woody",
    seasons: "spring,summer,autumn,winter",
    occasions: "day,night",
    longevity: 4,
    sillage: 3,
    palette: "#2b2118,#e8d5b5",
    shape: "box",
    variants: [{ label: "5 x 5ml", price: 950 }],
    bestseller: true,
    featured: true,
  },
  {
    name: "Noir Discovery Set",
    category: "discovery-sets",
    tagline: "Four extraits in 5ml minis",
    description:
      "The entire Noir Collection — Noir Oud Royale, Obsidian Iris, Cuir Sauvage and Ambre Imperial — in concentrated 5ml extraits.",
    gender: "UNISEX",
    concentration: "SET",
    genre: "FRENCH",
    top: "Assorted",
    heart: "Assorted",
    base: "Assorted",
    families: "oud,oriental",
    seasons: "autumn,winter",
    occasions: "night",
    longevity: 5,
    sillage: 4,
    palette: "#1a0f0a,#a06a3a",
    shape: "box",
    variants: [{ label: "4 x 5ml", price: 1490 }],
  },
  {
    name: "The Grand Library",
    category: "discovery-sets",
    tagline: "20 scents in 3ml vials",
    description:
      "Every perfume in the Signature and Diwan collections in a beautiful library box. The ultimate gift for the fragrance obsessive, or the best way to find your new favourite.",
    gender: "UNISEX",
    concentration: "SET",
    genre: "WESTERN",
    top: "Assorted",
    heart: "Assorted",
    base: "Assorted",
    families: "fresh,floral,woody,oriental",
    seasons: "spring,summer,autumn,winter",
    occasions: "day,night",
    longevity: 4,
    sillage: 3,
    palette: "#3a2a1c,#d8b98a",
    shape: "box",
    variants: [{ label: "20 x 3ml", price: 3990, compareAtPrice: 4800 }],
  },
  // ——— Body Mists ———
  {
    name: "Cotton Candy Cloud",
    category: "body-mists",
    tagline: "Spun sugar, berries & musk",
    description: "A playful, fluffy mist of spun sugar, wild berries and soft musk. Spritz on hair and body for an instant mood lift.",
    gender: "WOMEN",
    concentration: "MIST",
    genre: "WESTERN",
    top: "Wild Berries",
    heart: "Spun Sugar",
    base: "Soft Musk",
    families: "gourmand,fruity",
    seasons: "spring,summer",
    occasions: "day",
    longevity: 2,
    sillage: 2,
    palette: "#a04a6a,#f8cfe0",
    shape: "mist",
    variants: [{ label: "250ml", price: 1290 }],
  },
  {
    name: "Aqua Rush Mist",
    category: "body-mists",
    tagline: "Marine notes, mint & cedar",
    description: "An ice-cold rush of marine accord and mint over clean cedar. Keep one in the gym bag and one in the car.",
    gender: "MEN",
    concentration: "MIST",
    genre: "WESTERN",
    top: "Mint",
    heart: "Marine Accord",
    base: "Cedarwood",
    families: "fresh,aquatic",
    seasons: "summer",
    occasions: "day",
    longevity: 2,
    sillage: 2,
    palette: "#134a6a,#a8dcef",
    shape: "mist",
    variants: [{ label: "250ml", price: 1190 }],
  },
  {
    name: "Vanilla Silk Mist",
    category: "body-mists",
    tagline: "Madagascan vanilla & cashmere",
    description: "Warm vanilla and cashmere woods in a silky, skin-like mist. Layer it under Amber Reverie for extra depth.",
    gender: "WOMEN",
    concentration: "MIST",
    genre: "WESTERN",
    top: "Pear",
    heart: "Vanilla Orchid",
    base: "Cashmere Woods",
    families: "gourmand",
    seasons: "autumn,winter",
    occasions: "day,evening",
    longevity: 2,
    sillage: 2,
    palette: "#7a4a2a,#f3dcc0",
    shape: "mist",
    variants: [{ label: "250ml", price: 1290 }],
    isNew: true,
  },
  // ——— Home ———
  {
    name: "Sandal & Fig Reed Diffuser",
    category: "home-fragrance",
    tagline: "Creamy sandalwood & green fig",
    description:
      "Twelve weeks of quiet luxury. Rattan reeds diffuse green fig leaf, creamy sandalwood and a hint of coconut milk — perfect for living rooms and entryways.",
    gender: "UNISEX",
    concentration: "HOME",
    genre: "WESTERN",
    top: "Fig Leaf",
    heart: "Coconut Milk",
    base: "Sandalwood",
    families: "woody,fresh",
    seasons: "spring,summer,autumn,winter",
    occasions: "day",
    longevity: 5,
    sillage: 3,
    palette: "#4a3a20,#d9c08a",
    shape: "diffuser",
    variants: [{ label: "200ml", price: 3490 }],
    featured: true,
  },
  {
    name: "Amber Hearth Candle",
    category: "home-fragrance",
    tagline: "Amber, clove & crackling wood",
    description:
      "A soy-wax candle with a cotton wick and 50 hours of burn time. Amber, clove and smoky woods turn any room into a winter evening by the fire.",
    gender: "UNISEX",
    concentration: "HOME",
    genre: "WESTERN",
    top: "Clove",
    heart: "Amber",
    base: "Smoked Woods",
    families: "oriental,spicy,woody",
    seasons: "autumn,winter",
    occasions: "evening",
    longevity: 5,
    sillage: 3,
    palette: "#3a1a0a,#e0a050",
    shape: "candle",
    variants: [{ label: "220g", price: 2990 }],
    featured: true,
  },
  {
    name: "Cedar Drive Car Diffuser",
    category: "home-fragrance",
    tagline: "Cedar, bergamot & leather",
    description: "A vent-clip car diffuser with adjustable intensity. Cedar, bergamot and soft leather keep every commute fresh for 45 days.",
    gender: "UNISEX",
    concentration: "HOME",
    genre: "WESTERN",
    top: "Bergamot",
    heart: "Cedarwood",
    base: "Leather",
    families: "woody,fresh",
    seasons: "spring,summer,autumn,winter",
    occasions: "day",
    longevity: 4,
    sillage: 2,
    palette: "#2a2a2a,#9aa58a",
    shape: "diffuser",
    variants: [{ label: "10ml", price: 1490 }],
  },
  {
    name: "Aura Smart Diffuser",
    category: "home-fragrance",
    tagline: "App-controlled cold-air diffuser",
    description:
      "Whisper-quiet cold-air diffusion for spaces up to 1,500 sq ft, with scheduling and intensity control from your phone. Includes 100ml of Amber Reverie home oil.",
    gender: "UNISEX",
    concentration: "HOME",
    genre: "WESTERN",
    top: "Orange Blossom",
    heart: "Benzoin",
    base: "Amber",
    families: "oriental",
    seasons: "spring,summer,autumn,winter",
    occasions: "day",
    longevity: 5,
    sillage: 4,
    palette: "#1f1f24,#b9a6d6",
    shape: "tall",
    variants: [{ label: "Device + 100ml oil", price: 14800, compareAtPrice: 16500 }],
    isNew: true,
  },
];

const reviewers = [
  "Ayesha K.",
  "Hamza R.",
  "Fatima Z.",
  "Bilal A.",
  "Sana M.",
  "Usman T.",
  "Mahnoor S.",
  "Ali H.",
  "Zainab F.",
  "Omer Q.",
  "Hira N.",
  "Saad J.",
  "Iqra B.",
  "Daniyal W.",
  "Mehwish I.",
  "Fahad L.",
];

const reviewPool: { rating: number; title: string; body: string }[] = [
  { rating: 5, title: "My new signature", body: "Lasts all day even in this heat. I get compliments every single time I wear it to the office." },
  { rating: 5, title: "Smells way more expensive", body: "Honestly comparable to designer bottles three times the price. The drydown is gorgeous." },
  { rating: 4, title: "Beautiful, slightly soft", body: "Gorgeous scent and lovely packaging. Projection is a little softer than I expected but longevity is great." },
  { rating: 5, title: "Gifted it, now buying for myself", body: "Bought this as a gift for my husband and ended up stealing it. Delivery to Lahore took just two days." },
  { rating: 5, title: "Perfect for weddings", body: "Wore it to a mehndi and three people asked what I was wearing. Will definitely reorder." },
  { rating: 4, title: "Great value", body: "Very good quality for the price. The bottle feels premium and the cap is nice and heavy." },
  { rating: 5, title: "Obsessed", body: "The opening is lovely but the drydown after an hour is where it really shines. Still on my scarf the next morning." },
  { rating: 3, title: "Nice but not for me", body: "Well made and long lasting, just a bit too sweet for my taste. My sister loves it though." },
  { rating: 5, title: "Fast delivery, sealed packaging", body: "Arrived in Islamabad within 48 hours, perfectly packed. COD made it super easy." },
  { rating: 4, title: "Lovely everyday scent", body: "Easy to wear, not overpowering. Good for office and university." },
];

const firstNames = ["Ayesha", "Hamza", "Fatima", "Bilal", "Sana", "Usman", "Mahnoor", "Ali", "Zainab", "Omer", "Hira", "Saad", "Iqra", "Daniyal"];
const lastNames = ["Khan", "Raza", "Malik", "Ahmed", "Sheikh", "Qureshi", "Butt", "Siddiqui", "Hussain", "Chaudhry"];
const cityProvince: [string, string][] = [
  ["Karachi", "Sindh"],
  ["Lahore", "Punjab"],
  ["Islamabad", "Islamabad Capital Territory"],
  ["Rawalpindi", "Punjab"],
  ["Faisalabad", "Punjab"],
  ["Multan", "Punjab"],
  ["Peshawar", "Khyber Pakhtunkhwa"],
  ["Hyderabad", "Sindh"],
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const posts = [
  {
    title: "How to make your perfume last longer in Pakistan's heat",
    excerpt: "Humidity, 45°C afternoons and long commutes — here's how to keep your scent going from breakfast to dinner.",
    palette: "#3b1d12,#d08a4a",
    content: `Pakistani summers are brutal on fragrance. Heat makes perfume evaporate faster, and humidity changes how it projects. The good news: a few small habits can double the life of your favourite bottle.

## 1. Moisturise first
Fragrance clings to hydrated skin. Apply an unscented lotion (or a matching body mist) before you spray — dry skin simply drinks perfume up.

## 2. Target the pulse points
Spray on the neck, behind the ears, inner elbows and wrists. These areas are warm and help diffuse scent gently through the day.

## 3. Don't rub your wrists
Rubbing crushes the delicate top notes and speeds up evaporation. Spray, then let it settle on its own.

## 4. Spray your clothes (carefully)
Fabric holds scent far longer than skin. A light mist on a scarf, dupatta or jacket lining can last until the next day — just test on a hidden spot first.

## 5. Choose the right concentration
- **Eau de Toilette** — lighter, perfect for daytime and the office.
- **Eau de Parfum** — our standard; 6–10 hours on most skin.
- **Extrait & Attar** — the most concentrated options for all-day longevity.

## 6. Store it right
Keep bottles away from sunlight, bathroom steam and car dashboards. A cool drawer keeps your perfume smelling exactly as it should for years.`,
  },
  {
    title: "Attar vs Eau de Parfum: what's the difference?",
    excerpt: "Both are beautiful, both have centuries of history — but they wear very differently. A quick guide to choosing.",
    palette: "#4a1a08,#e0a03a",
    content: `Walk into any bazaar in Lahore or Karachi and you'll find attar sellers with rows of tiny crystal bottles. Walk into a mall and you'll find sleek sprays. So what's actually different?

## What is an attar?
An attar is a concentrated perfume oil. Traditionally, flowers and woods were distilled into a base oil like sandalwood. Modern attars are typically blended in a skin-safe oil carrier — and crucially, they contain **no alcohol**.

## What is an Eau de Parfum?
An EDP is perfume oil diluted in alcohol, usually at 15–20% concentration. The alcohol helps the scent project and "bloom" around you as it evaporates.

## How they wear
- **Projection:** EDPs radiate more; attars sit closer to the skin.
- **Longevity:** attars often outlast sprays because oil evaporates slowly.
- **Application:** dab an attar on pulse points; spray an EDP from 15cm away.

## Which should you choose?
If you want a scent that announces you, choose an EDP. If you prefer something intimate, alcohol-free and deeply long-lasting — or something to wear for prayers — an attar is a beautiful choice. Many of our customers wear both: attar underneath, EDP on top.`,
  },
  {
    title: "Building a fragrance wardrobe: one scent for every season",
    excerpt: "You wouldn't wear a winter coat in June. Here's how to rotate your perfumes with the weather.",
    palette: "#2d4b52,#f2c48a",
    content: `A fragrance wardrobe doesn't have to be big — four well-chosen bottles can cover almost every moment of the year.

## Spring: fresh florals
As the weather turns, reach for light florals and green notes. **Jasmine Monsoon** or **Hunza Morning** feel like the season itself.

## Summer: citrus & aquatic
Heat amplifies scent, so go lighter. Citrus, marine and herbal notes like those in **Citrus Lagoon** and **Karachi Breeze** stay fresh instead of cloying.

## Autumn: woods & spice
Cooler evenings call for warmth: vetiver, cedar and pepper. **Vetiver Coast** and **Qissa** bridge the gap beautifully.

## Winter: amber, oud & vanilla
This is when rich compositions truly shine. **Saffron Dusk**, **Amber Reverie** and **Noir Oud Royale** are made for wedding season.

## Not sure where to begin?
Our **Top 5 Discovery Set** lets you try five best-sellers for a week before committing — and it comes with a voucher towards your first full bottle.`,
  },
  {
    title: "The story of oud: the world's most precious wood",
    excerpt: "Why agarwood resin costs more than gold — and how it became the soul of Arabian and South Asian perfumery.",
    palette: "#1a0a08,#8b3a2a",
    content: `Oud — also called agarwood — forms when Aquilaria trees in South and Southeast Asia become infected with a mould. In response, the heartwood produces a dark, fragrant resin. Only a small percentage of wild trees ever develop it, which is why genuine oud oil can cost more per gram than gold.

## A scent with history
Oud has been burned in homes, mosques and palaces across the Middle East and the subcontinent for centuries. Mughal emperors perfumed their courts with it, and it remains the scent of celebration across Pakistan today.

## What does oud smell like?
Real oud is complex: woody, smoky, leathery, sometimes sweet and sometimes animalic. Paired with rose it becomes regal; with saffron, it glows; with amber, it feels like a warm embrace.

## Oud at Balincia
We source our oud through responsible plantation programmes, then blend it in compositions like **Lahore Nights**, **Noir Oud Royale** and our **Kesar Oud Attar**. If you're new to oud, start with **Amber Reverie** — a gentle introduction — before graduating to the Noir Collection.`,
  },
];

async function main() {
  console.log("Clearing database…");
  await db.orderEvent.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.variant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.address.deleteMany();
  await db.user.deleteMany();
  await db.coupon.deleteMany();
  await db.newsletterSubscriber.deleteMany();
  await db.contactMessage.deleteMany();
  await db.returnRequest.deleteMany();
  await db.post.deleteMany();
  await db.setting.deleteMany();

  console.log("Creating users…");
  const admin = await db.user.create({
    data: {
      name: "Balincia Admin",
      email: "admin@balincia.pk",
      passwordHash: await bcrypt.hash("Admin@12345", 10),
      role: "ADMIN",
    },
  });
  const customer = await db.user.create({
    data: {
      name: "Ayesha Khan",
      email: "ayesha@example.com",
      phone: "0300-1112233",
      passwordHash: await bcrypt.hash("Customer@123", 10),
      loyaltyPoints: 340,
      addresses: {
        create: {
          fullName: "Ayesha Khan",
          phone: "0300-1112233",
          line1: "House 14, Street 7, Phase 6, DHA",
          city: "Karachi",
          province: "Sindh",
          postalCode: "75500",
          isDefault: true,
        },
      },
    },
  });
  void admin;

  console.log("Creating categories…");
  const categoryIds: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const created = await db.category.create({ data: { ...c, sortOrder: i } });
    categoryIds[c.slug] = created.id;
  }

  console.log("Creating products…");
  const createdProducts: { id: string; name: string; slug: string; palette: string; shape: string; variants: { id: string; label: string; price: number }[] }[] = [];
  const now = Date.now();
  for (const [i, p] of products.entries()) {
    const slug = slugify(p.name);
    const cheapest = [...p.variants].sort((a, b) => a.price - b.price)[0];
    const product = await db.product.create({
      data: {
        name: p.name,
        slug,
        tagline: p.tagline,
        description: p.description,
        categoryId: categoryIds[p.category],
        gender: p.gender,
        concentration: p.concentration,
        genre: p.genre,
        topNotes: p.top,
        heartNotes: p.heart,
        baseNotes: p.base,
        families: p.families,
        seasons: p.seasons,
        occasions: p.occasions,
        longevity: p.longevity,
        sillage: p.sillage,
        palette: p.palette,
        bottleShape: p.shape,
        price: cheapest.price,
        compareAtPrice: cheapest.compareAtPrice ?? null,
        isFeatured: !!p.featured,
        isBestseller: !!p.bestseller,
        isNew: !!p.isNew,
        soldCount: p.bestseller ? between(180, 600) : between(10, 160),
        createdAt: new Date(now - (p.isNew ? between(1, 12) : between(30, 300)) * 86400000 - i * 1000),
        variants: {
          create: p.variants.map((v, vi) => ({
            label: v.label,
            sku: `BLC-${slug.slice(0, 10).toUpperCase()}-${v.label.replace(/[^a-z0-9]/gi, "").toUpperCase()}`,
            price: v.price,
            compareAtPrice: v.compareAtPrice ?? null,
            stock: v.stock ?? (i % 11 === 3 ? 3 : between(8, 60)),
            sortOrder: vi,
          })),
        },
      },
      include: { variants: true },
    });
    createdProducts.push({
      id: product.id,
      name: product.name,
      slug,
      palette: product.palette,
      shape: product.bottleShape,
      variants: product.variants.map((v) => ({ id: v.id, label: v.label, price: v.price })),
    });

    // Reviews
    const count = p.bestseller ? between(5, 9) : between(1, 5);
    const ratings: number[] = [];
    for (let r = 0; r < count; r++) {
      const base = pick(reviewPool);
      const rating = p.bestseller && base.rating < 4 ? 4 : base.rating;
      ratings.push(rating);
      await db.review.create({
        data: {
          productId: product.id,
          name: pick(reviewers),
          rating,
          title: base.title,
          body: base.body,
          createdAt: new Date(now - between(2, 120) * 86400000),
        },
      });
    }
    await db.product.update({
      where: { id: product.id },
      data: {
        ratingCount: ratings.length,
        ratingAvg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      },
    });
  }

  console.log("Creating orders…");
  const statuses = ["DELIVERED", "DELIVERED", "DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED", "PENDING", "CANCELLED"];
  const flow = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  for (let o = 0; o < 34; o++) {
    const forCustomer = o % 9 === 0;
    const first = forCustomer ? "Ayesha" : pick(firstNames);
    const last = forCustomer ? "Khan" : pick(lastNames);
    const [city, province] = forCustomer ? (["Karachi", "Sindh"] as [string, string]) : pick(cityProvince);
    const lines = Array.from({ length: between(1, 3) }, () => {
      const product = pick(createdProducts);
      const variant = pick(product.variants);
      return { product, variant, quantity: between(1, 2) };
    });
    const subtotal = lines.reduce((s, l) => s + l.variant.price * l.quantity, 0);
    const shippingFee = subtotal >= 3000 ? 0 : 250;
    const status = o < 3 ? "PENDING" : pick(statuses);
    const createdAt = new Date(now - between(0, 29) * 86400000 - between(0, 23) * 3600000);
    const reached = status === "CANCELLED" ? ["PENDING", "CANCELLED"] : flow.slice(0, flow.indexOf(status) + 1);
    const paymentMethod = pick(["COD", "COD", "COD", "BANK", "WALLET"]);
    await db.order.create({
      data: {
        number: `BLC-${(100000 + o * 7919).toString(36).toUpperCase().padStart(6, "0").slice(-6)}`,
        userId: forCustomer ? customer.id : null,
        email: forCustomer ? customer.email : `${first}.${last}${o}@example.com`.toLowerCase(),
        phone: `03${between(0, 4)}${between(0, 9)}-${between(1000000, 9999999)}`,
        fullName: `${first} ${last}`,
        line1: `House ${between(1, 300)}, Street ${between(1, 40)}, Block ${pick(["A", "B", "C", "D", "F"])}`,
        city,
        province,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        paymentMethod,
        paymentStatus: status === "DELIVERED" || (paymentMethod !== "COD" && status !== "PENDING" && status !== "CANCELLED") ? "PAID" : "PENDING",
        status,
        courier: ["SHIPPED", "DELIVERED"].includes(status) ? pick(["TCS", "Leopards", "M&P"]) : null,
        trackingNumber: ["SHIPPED", "DELIVERED"].includes(status) ? String(between(100000000, 999999999)) : null,
        pointsAwarded: forCustomer && status === "DELIVERED",
        createdAt,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            variantId: l.variant.id,
            name: l.product.name,
            variantLabel: l.variant.label,
            slug: l.product.slug,
            palette: l.product.palette,
            bottleShape: l.product.shape,
            price: l.variant.price,
            quantity: l.quantity,
          })),
        },
        events: {
          create: reached.map((s, idx) => ({
            status: s,
            note: s === "PENDING" ? "Order placed" : "",
            createdAt: new Date(createdAt.getTime() + idx * 20 * 3600000),
          })),
        },
      },
    });
  }

  console.log("Creating coupons, posts, settings…");
  await db.coupon.createMany({
    data: [
      { code: "WELCOME10", description: "10% off your first order", type: "PERCENT", value: 10, minSubtotal: 2000 },
      { code: "FLAT500", description: "Rs. 500 off orders over Rs. 5,000", type: "FIXED", value: 500, minSubtotal: 5000 },
      { code: "FREESHIP", description: "Free standard shipping", type: "FREESHIP", value: 0, minSubtotal: 0 },
      {
        code: "EID25",
        description: "Eid special — 25% off (expired)",
        type: "PERCENT",
        value: 25,
        minSubtotal: 3000,
        expiresAt: new Date(now - 30 * 86400000),
      },
    ],
  });

  for (const [i, post] of posts.entries()) {
    await db.post.create({
      data: { ...post, slug: slugify(post.title), createdAt: new Date(now - (i * 18 + 4) * 86400000) },
    });
  }

  await db.newsletterSubscriber.createMany({
    data: ["sana.m@example.com", "bilal.a@example.com", "hira.n@example.com", "omer.q@example.com"].map((email) => ({ email })),
  });

  await db.contactMessage.createMany({
    data: [
      {
        type: "CORPORATE",
        name: "Saad Jamil",
        email: "saad@acme.pk",
        phone: "0321-5556677",
        subject: "Corporate gifting — 120 boxes",
        message: "We'd like 120 customised gift boxes for our year-end client gifting. Can you share pricing and lead times?",
      },
      {
        type: "CONTACT",
        name: "Iqra Baig",
        email: "iqra.b@example.com",
        subject: "Is Velvet Rose suitable for sensitive skin?",
        message: "Hi! I have quite sensitive skin. Is Velvet Rose okay to spray directly or should I apply on clothes?",
      },
    ],
  });

  console.log("\n✔ Seed complete");
  console.log("  Admin:    admin@balincia.pk / Admin@12345");
  console.log("  Customer: ayesha@example.com / Customer@123\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

export const QUIZ = [
  {
    key: "gender",
    question: "Who are we finding a scent for?",
    options: [
      { value: "WOMEN", label: "For her", hint: "Feminine compositions" },
      { value: "MEN", label: "For him", hint: "Masculine compositions" },
      { value: "ANY", label: "Anyone", hint: "Show me everything" },
    ],
  },
  {
    key: "vibe",
    question: "Pick the mood that feels most like you.",
    options: [
      { value: "fresh", label: "Fresh & clean", hint: "Citrus, sea air, crisp linen", color: "#7cc6d6" },
      { value: "floral", label: "Floral & romantic", hint: "Rose, jasmine, soft fruits", color: "#e9a3b5" },
      { value: "warm", label: "Warm & sweet", hint: "Amber, vanilla, tonka", color: "#e7a65a" },
      { value: "dark", label: "Dark & smoky", hint: "Oud, leather, incense", color: "#8b3a2a" },
    ],
  },
  {
    key: "occasion",
    question: "When will you wear it most?",
    options: [
      { value: "day", label: "Everyday", hint: "Errands, uni, weekends" },
      { value: "office", label: "At work", hint: "Polished, never loud" },
      { value: "evening", label: "Dinners & events", hint: "Weddings, dawats, parties" },
      { value: "night", label: "Late nights", hint: "Made to be remembered" },
    ],
  },
  {
    key: "season",
    question: "Which season do you want it for?",
    options: [
      { value: "summer", label: "Summer", hint: "Light enough for 40°C" },
      { value: "winter", label: "Winter", hint: "Rich and enveloping" },
      { value: "spring", label: "Spring", hint: "Blooming and bright" },
      { value: "autumn", label: "Autumn", hint: "Woody and warm" },
    ],
  },
  {
    key: "intensity",
    question: "How bold should it be?",
    options: [
      { value: "2", label: "A whisper", hint: "Close to the skin" },
      { value: "3", label: "Noticeable", hint: "Arm's-length aura" },
      { value: "5", label: "A statement", hint: "Fills the room" },
    ],
  },
] as const;

export type QuizAnswers = { gender: string; vibe: string; occasion: string; season: string; intensity: string };

export const VIBE_FAMILIES: Record<string, string[]> = {
  fresh: ["fresh", "citrus", "aquatic"],
  floral: ["floral", "fruity"],
  warm: ["gourmand", "oriental"],
  dark: ["oud", "woody", "spicy"],
};

export const PERSONAS: Record<string, { name: string; description: string; palette: string }> = {
  fresh: {
    name: "The Free Spirit",
    description: "You're drawn to light, luminous scents that feel like a deep breath of sea air — effortless, clean and quietly confident.",
    palette: "#12384a,#7cc6d6",
  },
  floral: {
    name: "The Romantic",
    description: "Blooms, petals and a little sweetness. Your scents are soft-spoken but unforgettable — like a love letter on silk.",
    palette: "#5a1a2c,#e9a3b5",
  },
  warm: {
    name: "The Comfort Seeker",
    description: "Amber, vanilla and golden resins — you love fragrances that feel like cashmere and leave a warm, inviting trail.",
    palette: "#4a2412,#e7a65a",
  },
  dark: {
    name: "The Mystic",
    description: "Smoke, oud and leather. You wear scent as a signature — intense, magnetic and impossible to ignore.",
    palette: "#1a0a08,#8b3a2a",
  },
};

type Scorable = { gender: string; families: string; occasions: string; seasons: string; sillage: number };

export function scoreProduct(p: Scorable, a: QuizAnswers) {
  let score = 0;
  if (a.gender !== "ANY") {
    if (p.gender === a.gender) score += 3;
    else if (p.gender === "UNISEX") score += 2;
    else score -= 10;
  }
  const families = p.families.split(",");
  score += (VIBE_FAMILIES[a.vibe] ?? []).filter((f) => families.includes(f)).slice(0, 2).length * 3;
  if (p.occasions.includes(a.occasion)) score += 2;
  if (p.seasons.includes(a.season)) score += 2;
  score += 2 - Math.abs(p.sillage - Number(a.intensity || 3));
  return score;
}

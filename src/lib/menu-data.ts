import type { Lang } from "./i18n";

/**
 * Antes eran uniones cerradas de 4 valores fijos. Se relajan a `string` porque cada
 * restaurante multi-tenant define su propia lista de categorías/tags (ver
 * `src/lib/restaurants.ts`); la demo estática en `/` sigue usando los mismos 4
 * valores de siempre, así que no cambia en la práctica.
 */
export type CategoryId = string;
export type TagId = string;

export interface Dish {
  id: string;
  cat: CategoryId;
  name: string;
  price: number;
  tags: TagId[];
  desc: string;
  ing: string[];
  /** Card / hero photo. Only the scallops have real photography for now. */
  imageUrl?: string;
  /**
   * glTF binario servido a <model-viewer>. Un plato sin `modelGlbUrl` no abre AR: se
   * queda en el estado "modelSoon". No hay fallback ni modelo por defecto.
   */
  modelGlbUrl?: string;
  /**
   * USDZ propio para Quick Look (iOS). Es OPCIONAL: si falta, model-viewer
   * convierte el .glb a USDZ en el propio dispositivo. Solo conviene rellenarlo
   * con un USDZ exportado a mano si la conversión automática no hace justicia al
   * material. Ojo: si apunta a un archivo que no existe, Quick Look falla en
   * silencio, así que es mejor dejarlo vacío que ponerlo "por si acaso".
   */
  modelUsdzUrl?: string;
}

export const CATEGORY_IDS: CategoryId[] = ["starters", "mains", "drinks", "desserts"];

/**
 * Shared shape between the static demo (built from CATEGORY_IDS + i18n
 * Strings.cats) and tenant menus (built from a restaurant's own categories
 * field). MenuScreen/DishDetailScreen only know this shape, not where it
 * came from.
 */
export interface MenuCategory {
  id: string;
  label: string;
}

export const DISHES: Dish[] = [
  {
    id: "scallops",
    cat: "starters",
    name: "Seared Scallops",
    price: 28,
    tags: ["Signature", "Seafood"],
    desc: "Hand-dived Hokkaido scallops seared in brown butter, over silky cauliflower purée with chorizo crumble and pickled apple.",
    ing: ["Hokkaido scallops", "Cauliflower purée", "Chorizo crumble", "Pickled apple", "Micro herbs"],
    imageUrl: "/assets/dish-scallops-card.jpg",
    // Versiona la URL aunque el archivo físico conserve su nombre actual.
    modelGlbUrl: "/assets/object.glb?v=20260713",
  },
  {
    id: "burrata",
    cat: "starters",
    name: "Burrata & Heirloom Tomato",
    price: 19,
    tags: ["Vegetarian"],
    desc: "Creamy burrata with heirloom tomatoes, basil oil and 12-year aged balsamic.",
    ing: ["Burrata", "Heirloom tomato", "Basil oil", "Aged balsamic", "Sea salt"],
  },
  {
    id: "tartare",
    cat: "starters",
    name: "Yellowfin Tuna Tartare",
    price: 24,
    tags: ["Seafood", "Best Seller"],
    desc: "Line-caught yellowfin tuna, avocado, citrus soy dressing and a sesame rice crisp.",
    ing: ["Yellowfin tuna", "Avocado", "Citrus soy", "Sesame crisp", "Chives"],
  },
  {
    id: "octopus",
    cat: "mains",
    name: "Grilled Octopus",
    price: 34,
    tags: ["Seafood", "Signature"],
    desc: "Charred octopus with smoked paprika, confit potato and salsa verde.",
    ing: ["Octopus", "Smoked paprika", "Confit potato", "Salsa verde", "Lemon"],
  },
  {
    id: "filet",
    cat: "mains",
    name: "Filet Mignon",
    price: 46,
    tags: ["Best Seller"],
    desc: "8oz grass-fed filet, truffle pomme purée, glazed shallots and red wine jus.",
    ing: ["Grass-fed filet", "Truffle pomme purée", "Glazed shallots", "Red wine jus"],
  },
  {
    id: "risotto",
    cat: "mains",
    name: "Wild Mushroom Risotto",
    price: 29,
    tags: ["Vegetarian"],
    desc: "Carnaroli rice slowly folded with porcini, parmesan and white truffle oil.",
    ing: ["Carnaroli rice", "Porcini", "Parmesan", "White truffle oil"],
  },
  {
    id: "catch",
    cat: "mains",
    name: "Catch of the Day",
    price: 38,
    tags: ["Seafood"],
    desc: "Today’s market fish from local waters, saffron beurre blanc, seasonal vegetables.",
    ing: ["Market fish", "Saffron beurre blanc", "Seasonal vegetables"],
  },
  {
    id: "spritz",
    cat: "drinks",
    name: "Coastal Spritz",
    price: 14,
    tags: [],
    desc: "Aperitivo, sparkling wine, fresh grapefruit and torched rosemary.",
    ing: ["Aperitivo", "Sparkling wine", "Grapefruit", "Rosemary"],
  },
  {
    id: "sour",
    cat: "drinks",
    name: "Andean Sour",
    price: 15,
    tags: ["Signature"],
    desc: "Small-batch pisco, fresh lime, silky egg white and angostura.",
    ing: ["Pisco", "Lime", "Egg white", "Angostura"],
  },
  {
    id: "gintonic",
    cat: "drinks",
    name: "Cloud Forest G&T",
    price: 16,
    tags: [],
    desc: "Botanical gin, premium tonic, cucumber ribbon and juniper.",
    ing: ["Botanical gin", "Tonic", "Cucumber", "Juniper"],
  },
  {
    id: "fondant",
    cat: "desserts",
    name: "Dark Chocolate Fondant",
    price: 16,
    tags: ["Best Seller"],
    desc: "70% cacao fondant with a molten center and vanilla bean ice cream.",
    ing: ["70% cacao", "Molten center", "Vanilla bean ice cream"],
  },
  {
    id: "pavlova",
    cat: "desserts",
    name: "Passion Fruit Pavlova",
    price: 14,
    tags: ["Vegetarian"],
    desc: "Crisp meringue, passion fruit curd and light chantilly cream.",
    ing: ["Meringue", "Passion fruit curd", "Chantilly"],
  },
  {
    id: "affogato",
    cat: "desserts",
    name: "Affogato",
    price: 12,
    tags: [],
    desc: "Double espresso poured over vanilla gelato, amaretti crumble.",
    ing: ["Espresso", "Vanilla gelato", "Amaretti"],
  },
];

export const TAG_STYLE: Record<TagId, { color: string; border: string; bg: string }> = {
  Signature: { color: "#D8B872", border: "rgba(201,165,106,.45)", bg: "rgba(201,165,106,.08)" },
  Vegetarian: { color: "#8FCC9A", border: "rgba(124,196,138,.4)", bg: "rgba(124,196,138,.08)" },
  Seafood: { color: "#8FB8D4", border: "rgba(127,174,201,.4)", bg: "rgba(127,174,201,.08)" },
  "Best Seller": { color: "#E4DDD0", border: "rgba(228,221,208,.35)", bg: "rgba(228,221,208,.07)" },
};

const TAG_LABEL: Record<Exclude<Lang, "en">, Record<TagId, string>> = {
  es: { Signature: "De la Casa", Vegetarian: "Vegetariano", Seafood: "Del Mar", "Best Seller": "Más Vendido" },
  fr: { Signature: "Signature", Vegetarian: "Végétarien", Seafood: "Fruits de Mer", "Best Seller": "Best-Seller" },
};

export function tagLabel(tag: TagId, lang: Lang): string {
  const label = lang === "en" ? tag : TAG_LABEL[lang][tag] ?? tag;
  return label.toUpperCase();
}

/** Monogram shown while a dish has no photography yet, e.g. "Grilled Octopus" → "GO". */
export function dishInitials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w[0] && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

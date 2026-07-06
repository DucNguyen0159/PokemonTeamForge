import { resolvePokemonSlug } from "@/lib/pokemon/pokemon-slug-aliases";
import type { PokemonType } from "@/types/shared";

export type ChampionsPresetSpeciesDisplay = {
  displaySlug: string;
  spriteNormal: string;
  primaryType: PokemonType;
  secondaryType: PokemonType | null;
};

export const CHAMPIONS_PRESET_SPECIES_DISPLAY: Record<string, ChampionsPresetSpeciesDisplay> = {
  "aegislash-shield": {
    displaySlug: "aegislash-shield",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/681.png",
    primaryType: "steel",
    secondaryType: "ghost",
  },
  "alakazam": {
    displaySlug: "alakazam",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png",
    primaryType: "psychic",
    secondaryType: null,
  },
  "amoonguss": {
    displaySlug: "amoonguss",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/591.png",
    primaryType: "grass",
    secondaryType: "poison",
  },
  "arcanine": {
    displaySlug: "arcanine",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png",
    primaryType: "fire",
    secondaryType: null,
  },
  "archaludon": {
    displaySlug: "archaludon",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1018.png",
    primaryType: "steel",
    secondaryType: "dragon",
  },
  "armarouge": {
    displaySlug: "armarouge",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/936.png",
    primaryType: "fire",
    secondaryType: "psychic",
  },
  "azumarill": {
    displaySlug: "azumarill",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/184.png",
    primaryType: "water",
    secondaryType: "fairy",
  },
  "basculegion-male": {
    displaySlug: "basculegion-male",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/902.png",
    primaryType: "water",
    secondaryType: "ghost",
  },
  "baxcalibur": {
    displaySlug: "baxcalibur",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/998.png",
    primaryType: "dragon",
    secondaryType: "ice",
  },
  "blissey": {
    displaySlug: "blissey",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/242.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "breloom": {
    displaySlug: "breloom",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/286.png",
    primaryType: "grass",
    secondaryType: "fighting",
  },
  "camerupt": {
    displaySlug: "camerupt",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/323.png",
    primaryType: "fire",
    secondaryType: "ground",
  },
  "ceruledge": {
    displaySlug: "ceruledge",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/937.png",
    primaryType: "fire",
    secondaryType: "ghost",
  },
  "chandelure": {
    displaySlug: "chandelure",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/609.png",
    primaryType: "ghost",
    secondaryType: "fire",
  },
  "charizard": {
    displaySlug: "charizard",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    primaryType: "fire",
    secondaryType: "flying",
  },
  "cinccino": {
    displaySlug: "cinccino",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/573.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "cinderace": {
    displaySlug: "cinderace",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/815.png",
    primaryType: "fire",
    secondaryType: null,
  },
  "clefable": {
    displaySlug: "clefable",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/36.png",
    primaryType: "fairy",
    secondaryType: null,
  },
  "clodsire": {
    displaySlug: "clodsire",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/980.png",
    primaryType: "poison",
    secondaryType: "ground",
  },
  "cloyster": {
    displaySlug: "cloyster",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/91.png",
    primaryType: "water",
    secondaryType: "ice",
  },
  "conkeldurr": {
    displaySlug: "conkeldurr",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/534.png",
    primaryType: "fighting",
    secondaryType: null,
  },
  "corviknight": {
    displaySlug: "corviknight",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/823.png",
    primaryType: "flying",
    secondaryType: "steel",
  },
  "dragapult": {
    displaySlug: "dragapult",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/887.png",
    primaryType: "dragon",
    secondaryType: "ghost",
  },
  "dragonite": {
    displaySlug: "dragonite",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
    primaryType: "dragon",
    secondaryType: "flying",
  },
  "dusclops": {
    displaySlug: "dusclops",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/356.png",
    primaryType: "ghost",
    secondaryType: null,
  },
  "excadrill": {
    displaySlug: "excadrill",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/530.png",
    primaryType: "ground",
    secondaryType: "steel",
  },
  "farigiraf": {
    displaySlug: "farigiraf",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/981.png",
    primaryType: "normal",
    secondaryType: "psychic",
  },
  "ferrothorn": {
    displaySlug: "ferrothorn",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/598.png",
    primaryType: "grass",
    secondaryType: "steel",
  },
  "floette": {
    displaySlug: "floette",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/670.png",
    primaryType: "fairy",
    secondaryType: null,
  },
  "gallade": {
    displaySlug: "gallade",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/475.png",
    primaryType: "psychic",
    secondaryType: "fighting",
  },
  "garchomp": {
    displaySlug: "garchomp",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png",
    primaryType: "dragon",
    secondaryType: "ground",
  },
  "gardevoir": {
    displaySlug: "gardevoir",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png",
    primaryType: "psychic",
    secondaryType: "fairy",
  },
  "gastrodon": {
    displaySlug: "gastrodon",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/423.png",
    primaryType: "water",
    secondaryType: "ground",
  },
  "gengar": {
    displaySlug: "gengar",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    primaryType: "ghost",
    secondaryType: "poison",
  },
  "gholdengo": {
    displaySlug: "gholdengo",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1000.png",
    primaryType: "steel",
    secondaryType: "ghost",
  },
  "gliscor": {
    displaySlug: "gliscor",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/472.png",
    primaryType: "ground",
    secondaryType: "flying",
  },
  "greninja": {
    displaySlug: "greninja",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png",
    primaryType: "water",
    secondaryType: "dark",
  },
  "grimmsnarl": {
    displaySlug: "grimmsnarl",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/861.png",
    primaryType: "dark",
    secondaryType: "fairy",
  },
  "hatterene": {
    displaySlug: "hatterene",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/858.png",
    primaryType: "psychic",
    secondaryType: "fairy",
  },
  "hawlucha": {
    displaySlug: "hawlucha",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/701.png",
    primaryType: "fighting",
    secondaryType: "flying",
  },
  "haxorus": {
    displaySlug: "haxorus",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/612.png",
    primaryType: "dragon",
    secondaryType: null,
  },
  "heracross": {
    displaySlug: "heracross",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/214.png",
    primaryType: "bug",
    secondaryType: "fighting",
  },
  "hippowdon": {
    displaySlug: "hippowdon",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/450.png",
    primaryType: "ground",
    secondaryType: null,
  },
  "hitmontop": {
    displaySlug: "hitmontop",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/237.png",
    primaryType: "fighting",
    secondaryType: null,
  },
  "hydreigon": {
    displaySlug: "hydreigon",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/635.png",
    primaryType: "dark",
    secondaryType: "dragon",
  },
  "incineroar": {
    displaySlug: "incineroar",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/727.png",
    primaryType: "fire",
    secondaryType: "dark",
  },
  "indeedee-female": {
    displaySlug: "indeedee-female",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10186.png",
    primaryType: "psychic",
    secondaryType: "normal",
  },
  "kangaskhan": {
    displaySlug: "kangaskhan",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/115.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "kilowattrel": {
    displaySlug: "kilowattrel",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/941.png",
    primaryType: "electric",
    secondaryType: "flying",
  },
  "kingambit": {
    displaySlug: "kingambit",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/983.png",
    primaryType: "dark",
    secondaryType: "steel",
  },
  "kingdra": {
    displaySlug: "kingdra",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/230.png",
    primaryType: "water",
    secondaryType: "dragon",
  },
  "lopunny": {
    displaySlug: "lopunny",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/428.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "lucario": {
    displaySlug: "lucario",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png",
    primaryType: "fighting",
    secondaryType: "steel",
  },
  "maushold-family-of-four": {
    displaySlug: "maushold-family-of-four",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/925.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "mawile": {
    displaySlug: "mawile",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/303.png",
    primaryType: "steel",
    secondaryType: "fairy",
  },
  "meowscarada": {
    displaySlug: "meowscarada",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/908.png",
    primaryType: "grass",
    secondaryType: "dark",
  },
  "meowstic-male": {
    displaySlug: "meowstic-male",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/678.png",
    primaryType: "psychic",
    secondaryType: null,
  },
  "metagross": {
    displaySlug: "metagross",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/376.png",
    primaryType: "steel",
    secondaryType: "psychic",
  },
  "milotic": {
    displaySlug: "milotic",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/350.png",
    primaryType: "water",
    secondaryType: null,
  },
  "mimikyu-disguised": {
    displaySlug: "mimikyu-disguised",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/778.png",
    primaryType: "ghost",
    secondaryType: "fairy",
  },
  "ninetales-alola": {
    displaySlug: "ninetales-alola",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10104.png",
    primaryType: "ice",
    secondaryType: "fairy",
  },
  "oranguru": {
    displaySlug: "oranguru",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/765.png",
    primaryType: "normal",
    secondaryType: "psychic",
  },
  "pelipper": {
    displaySlug: "pelipper",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/279.png",
    primaryType: "water",
    secondaryType: "flying",
  },
  "pinsir": {
    displaySlug: "pinsir",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/127.png",
    primaryType: "bug",
    secondaryType: null,
  },
  "porygon2": {
    displaySlug: "porygon2",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/233.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "raichu": {
    displaySlug: "raichu",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png",
    primaryType: "electric",
    secondaryType: null,
  },
  "ribombee": {
    displaySlug: "ribombee",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/743.png",
    primaryType: "bug",
    secondaryType: "fairy",
  },
  "rillaboom": {
    displaySlug: "rillaboom",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/812.png",
    primaryType: "grass",
    secondaryType: null,
  },
  "rotom-wash": {
    displaySlug: "rotom-wash",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10009.png",
    primaryType: "electric",
    secondaryType: "water",
  },
  "sableye": {
    displaySlug: "sableye",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/302.png",
    primaryType: "dark",
    secondaryType: "ghost",
  },
  "salamence": {
    displaySlug: "salamence",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/373.png",
    primaryType: "dragon",
    secondaryType: "flying",
  },
  "scizor": {
    displaySlug: "scizor",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png",
    primaryType: "bug",
    secondaryType: "steel",
  },
  "sinistcha": {
    displaySlug: "sinistcha",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1013.png",
    primaryType: "grass",
    secondaryType: "ghost",
  },
  "snorlax": {
    displaySlug: "snorlax",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "staraptor": {
    displaySlug: "staraptor",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/398.png",
    primaryType: "normal",
    secondaryType: "flying",
  },
  "swampert": {
    displaySlug: "swampert",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/260.png",
    primaryType: "water",
    secondaryType: "ground",
  },
  "tinkaton": {
    displaySlug: "tinkaton",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/959.png",
    primaryType: "fairy",
    secondaryType: "steel",
  },
  "torkoal": {
    displaySlug: "torkoal",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/324.png",
    primaryType: "fire",
    secondaryType: null,
  },
  "toxapex": {
    displaySlug: "toxapex",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/748.png",
    primaryType: "poison",
    secondaryType: "water",
  },
  "tyranitar": {
    displaySlug: "tyranitar",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png",
    primaryType: "rock",
    secondaryType: "dark",
  },
  "ursaluna": {
    displaySlug: "ursaluna",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/901.png",
    primaryType: "ground",
    secondaryType: "normal",
  },
  "vanilluxe": {
    displaySlug: "vanilluxe",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/584.png",
    primaryType: "ice",
    secondaryType: null,
  },
  "venusaur": {
    displaySlug: "venusaur",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    primaryType: "grass",
    secondaryType: "poison",
  },
  "victreebel": {
    displaySlug: "victreebel",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/71.png",
    primaryType: "grass",
    secondaryType: "poison",
  },
  "weavile": {
    displaySlug: "weavile",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/461.png",
    primaryType: "dark",
    secondaryType: "ice",
  },
  "whimsicott": {
    displaySlug: "whimsicott",
    spriteNormal: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/547.png",
    primaryType: "grass",
    secondaryType: "fairy",
  }
};

export const ALL_CHAMPIONS_PRESET_SPECIES_SLUGS = ["aegislash-shield","alakazam","amoonguss","arcanine","archaludon","armarouge","azumarill","basculegion-male","baxcalibur","blissey","breloom","camerupt","ceruledge","chandelure","charizard","cinccino","cinderace","clefable","clodsire","cloyster","conkeldurr","corviknight","dragapult","dragonite","dusclops","excadrill","farigiraf","ferrothorn","floette","gallade","garchomp","gardevoir","gastrodon","gengar","gholdengo","gliscor","greninja","grimmsnarl","hatterene","hawlucha","haxorus","heracross","hippowdon","hitmontop","hydreigon","incineroar","indeedee-female","kangaskhan","kilowattrel","kingambit","kingdra","lopunny","lucario","maushold-family-of-four","mawile","meowscarada","meowstic-male","metagross","milotic","mimikyu-disguised","ninetales-alola","oranguru","pelipper","pinsir","porygon2","raichu","ribombee","rillaboom","rotom-wash","sableye","salamence","scizor","sinistcha","snorlax","staraptor","swampert","tinkaton","torkoal","toxapex","tyranitar","ursaluna","vanilluxe","venusaur","victreebel","weavile","whimsicott"] as const;

export function getAllChampionsPresetSpeciesSlugs(): string[] {
  return [...ALL_CHAMPIONS_PRESET_SPECIES_SLUGS];
}

export function getPresetSpeciesDisplay(speciesName: string): ChampionsPresetSpeciesDisplay | null {
  const slug = resolvePokemonSlug(speciesName);
  return slug ? (CHAMPIONS_PRESET_SPECIES_DISPLAY[slug] ?? null) : null;
}

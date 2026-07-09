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
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/aegislash-shield/normal.png",
    primaryType: "steel",
    secondaryType: "ghost",
  },
  "alakazam": {
    displaySlug: "alakazam",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/alakazam/normal.png",
    primaryType: "psychic",
    secondaryType: null,
  },
  "amoonguss": {
    displaySlug: "amoonguss",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/amoonguss/normal.png",
    primaryType: "grass",
    secondaryType: "poison",
  },
  "arcanine": {
    displaySlug: "arcanine",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/arcanine/normal.png",
    primaryType: "fire",
    secondaryType: null,
  },
  "archaludon": {
    displaySlug: "archaludon",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/archaludon/normal.png",
    primaryType: "steel",
    secondaryType: "dragon",
  },
  "armarouge": {
    displaySlug: "armarouge",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/armarouge/normal.png",
    primaryType: "fire",
    secondaryType: "psychic",
  },
  "azumarill": {
    displaySlug: "azumarill",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/azumarill/normal.png",
    primaryType: "water",
    secondaryType: "fairy",
  },
  "basculegion-male": {
    displaySlug: "basculegion-male",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/basculegion-male/normal.png",
    primaryType: "water",
    secondaryType: "ghost",
  },
  "baxcalibur": {
    displaySlug: "baxcalibur-mega",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/baxcalibur-mega/normal.png",
    primaryType: "dragon",
    secondaryType: "ice",
  },
  "blissey": {
    displaySlug: "blissey",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/blissey/normal.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "breloom": {
    displaySlug: "breloom",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/breloom/normal.png",
    primaryType: "grass",
    secondaryType: "fighting",
  },
  "camerupt": {
    displaySlug: "camerupt",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/camerupt/normal.png",
    primaryType: "fire",
    secondaryType: "ground",
  },
  "ceruledge": {
    displaySlug: "ceruledge",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/ceruledge/normal.png",
    primaryType: "fire",
    secondaryType: "ghost",
  },
  "chandelure": {
    displaySlug: "chandelure",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/chandelure/normal.png",
    primaryType: "ghost",
    secondaryType: "fire",
  },
  "charizard": {
    displaySlug: "charizard",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/charizard/normal.png",
    primaryType: "fire",
    secondaryType: "flying",
  },
  "cinccino": {
    displaySlug: "cinccino",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/cinccino/normal.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "cinderace": {
    displaySlug: "cinderace",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/cinderace/normal.png",
    primaryType: "fire",
    secondaryType: null,
  },
  "clefable": {
    displaySlug: "clefable",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/clefable/normal.png",
    primaryType: "fairy",
    secondaryType: null,
  },
  "clodsire": {
    displaySlug: "clodsire",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/clodsire/normal.png",
    primaryType: "poison",
    secondaryType: "ground",
  },
  "cloyster": {
    displaySlug: "cloyster",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/cloyster/normal.png",
    primaryType: "water",
    secondaryType: "ice",
  },
  "conkeldurr": {
    displaySlug: "conkeldurr",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/conkeldurr/normal.png",
    primaryType: "fighting",
    secondaryType: null,
  },
  "corviknight": {
    displaySlug: "corviknight",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/corviknight/normal.png",
    primaryType: "flying",
    secondaryType: "steel",
  },
  "dragapult": {
    displaySlug: "dragapult",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/dragapult/normal.png",
    primaryType: "dragon",
    secondaryType: "ghost",
  },
  "dragonite": {
    displaySlug: "dragonite",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/dragonite/normal.png",
    primaryType: "dragon",
    secondaryType: "flying",
  },
  "dusclops": {
    displaySlug: "dusclops",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/dusclops/normal.png",
    primaryType: "ghost",
    secondaryType: null,
  },
  "excadrill": {
    displaySlug: "excadrill",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/excadrill/normal.png",
    primaryType: "ground",
    secondaryType: "steel",
  },
  "farigiraf": {
    displaySlug: "farigiraf",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/farigiraf/normal.png",
    primaryType: "normal",
    secondaryType: "psychic",
  },
  "ferrothorn": {
    displaySlug: "ferrothorn",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/ferrothorn/normal.png",
    primaryType: "grass",
    secondaryType: "steel",
  },
  "floette": {
    displaySlug: "floette",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/floette/normal.png",
    primaryType: "fairy",
    secondaryType: null,
  },
  "gallade": {
    displaySlug: "gallade",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/gallade/normal.png",
    primaryType: "psychic",
    secondaryType: "fighting",
  },
  "garchomp": {
    displaySlug: "garchomp",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/garchomp/normal.png",
    primaryType: "dragon",
    secondaryType: "ground",
  },
  "gardevoir": {
    displaySlug: "gardevoir",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/gardevoir/normal.png",
    primaryType: "psychic",
    secondaryType: "fairy",
  },
  "gastrodon": {
    displaySlug: "gastrodon",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/gastrodon/normal.png",
    primaryType: "water",
    secondaryType: "ground",
  },
  "gengar": {
    displaySlug: "gengar",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/gengar/normal.png",
    primaryType: "ghost",
    secondaryType: "poison",
  },
  "gholdengo": {
    displaySlug: "gholdengo",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/gholdengo/normal.png",
    primaryType: "steel",
    secondaryType: "ghost",
  },
  "gliscor": {
    displaySlug: "gliscor",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/gliscor/normal.png",
    primaryType: "ground",
    secondaryType: "flying",
  },
  "greninja": {
    displaySlug: "greninja",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/greninja/normal.png",
    primaryType: "water",
    secondaryType: "dark",
  },
  "grimmsnarl": {
    displaySlug: "grimmsnarl",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/grimmsnarl/normal.png",
    primaryType: "dark",
    secondaryType: "fairy",
  },
  "hatterene": {
    displaySlug: "hatterene",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/hatterene/normal.png",
    primaryType: "psychic",
    secondaryType: "fairy",
  },
  "hawlucha": {
    displaySlug: "hawlucha",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/hawlucha/normal.png",
    primaryType: "fighting",
    secondaryType: "flying",
  },
  "haxorus": {
    displaySlug: "haxorus",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/haxorus/normal.png",
    primaryType: "dragon",
    secondaryType: null,
  },
  "heracross": {
    displaySlug: "heracross",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/heracross/normal.png",
    primaryType: "bug",
    secondaryType: "fighting",
  },
  "hippowdon": {
    displaySlug: "hippowdon",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/hippowdon/normal.png",
    primaryType: "ground",
    secondaryType: null,
  },
  "hitmontop": {
    displaySlug: "hitmontop",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/hitmontop/normal.png",
    primaryType: "fighting",
    secondaryType: null,
  },
  "hydreigon": {
    displaySlug: "hydreigon",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/hydreigon/normal.png",
    primaryType: "dark",
    secondaryType: "dragon",
  },
  "incineroar": {
    displaySlug: "incineroar",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/incineroar/normal.png",
    primaryType: "fire",
    secondaryType: "dark",
  },
  "indeedee-female": {
    displaySlug: "indeedee-female",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/indeedee-female/normal.png",
    primaryType: "psychic",
    secondaryType: "normal",
  },
  "kangaskhan": {
    displaySlug: "kangaskhan",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/kangaskhan/normal.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "kilowattrel": {
    displaySlug: "kilowattrel",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/kilowattrel/normal.png",
    primaryType: "electric",
    secondaryType: "flying",
  },
  "kingambit": {
    displaySlug: "kingambit",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/kingambit/normal.png",
    primaryType: "dark",
    secondaryType: "steel",
  },
  "kingdra": {
    displaySlug: "kingdra",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/kingdra/normal.png",
    primaryType: "water",
    secondaryType: "dragon",
  },
  "lopunny": {
    displaySlug: "lopunny",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/lopunny/normal.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "lucario": {
    displaySlug: "lucario",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/lucario/normal.png",
    primaryType: "fighting",
    secondaryType: "steel",
  },
  "maushold-family-of-four": {
    displaySlug: "maushold-family-of-four",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/maushold-family-of-four/normal.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "mawile": {
    displaySlug: "mawile",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/mawile/normal.png",
    primaryType: "steel",
    secondaryType: "fairy",
  },
  "meowscarada": {
    displaySlug: "meowscarada",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/meowscarada/normal.png",
    primaryType: "grass",
    secondaryType: "dark",
  },
  "meowstic-male": {
    displaySlug: "meowstic-male",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/meowstic-male/normal.png",
    primaryType: "psychic",
    secondaryType: null,
  },
  "metagross": {
    displaySlug: "metagross",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/metagross/normal.png",
    primaryType: "steel",
    secondaryType: "psychic",
  },
  "milotic": {
    displaySlug: "milotic",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/milotic/normal.png",
    primaryType: "water",
    secondaryType: null,
  },
  "mimikyu-disguised": {
    displaySlug: "mimikyu-disguised",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/mimikyu-disguised/normal.png",
    primaryType: "ghost",
    secondaryType: "fairy",
  },
  "ninetales-alola": {
    displaySlug: "ninetales-alola",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/ninetales-alola/normal.png",
    primaryType: "ice",
    secondaryType: "fairy",
  },
  "oranguru": {
    displaySlug: "oranguru",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/oranguru/normal.png",
    primaryType: "normal",
    secondaryType: "psychic",
  },
  "pelipper": {
    displaySlug: "pelipper",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/pelipper/normal.png",
    primaryType: "water",
    secondaryType: "flying",
  },
  "pinsir": {
    displaySlug: "pinsir",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/pinsir/normal.png",
    primaryType: "bug",
    secondaryType: null,
  },
  "porygon2": {
    displaySlug: "porygon2",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/porygon2/normal.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "raichu": {
    displaySlug: "raichu",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/raichu/normal.png",
    primaryType: "electric",
    secondaryType: null,
  },
  "ribombee": {
    displaySlug: "ribombee",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/ribombee/normal.png",
    primaryType: "bug",
    secondaryType: "fairy",
  },
  "rillaboom": {
    displaySlug: "rillaboom",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/rillaboom/normal.png",
    primaryType: "grass",
    secondaryType: null,
  },
  "rotom-wash": {
    displaySlug: "rotom-wash",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/rotom-wash/normal.png",
    primaryType: "electric",
    secondaryType: "water",
  },
  "sableye": {
    displaySlug: "sableye",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/sableye/normal.png",
    primaryType: "dark",
    secondaryType: "ghost",
  },
  "salamence": {
    displaySlug: "salamence",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/salamence/normal.png",
    primaryType: "dragon",
    secondaryType: "flying",
  },
  "scizor": {
    displaySlug: "scizor",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/scizor/normal.png",
    primaryType: "bug",
    secondaryType: "steel",
  },
  "sinistcha": {
    displaySlug: "sinistcha",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/sinistcha/normal.png",
    primaryType: "grass",
    secondaryType: "ghost",
  },
  "snorlax": {
    displaySlug: "snorlax",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/snorlax/normal.png",
    primaryType: "normal",
    secondaryType: null,
  },
  "staraptor": {
    displaySlug: "staraptor",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/staraptor/normal.png",
    primaryType: "normal",
    secondaryType: "flying",
  },
  "swampert": {
    displaySlug: "swampert",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/swampert/normal.png",
    primaryType: "water",
    secondaryType: "ground",
  },
  "tinkaton": {
    displaySlug: "tinkaton",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/tinkaton/normal.png",
    primaryType: "fairy",
    secondaryType: "steel",
  },
  "torkoal": {
    displaySlug: "torkoal",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/torkoal/normal.png",
    primaryType: "fire",
    secondaryType: null,
  },
  "toxapex": {
    displaySlug: "toxapex",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/toxapex/normal.png",
    primaryType: "poison",
    secondaryType: "water",
  },
  "tyranitar": {
    displaySlug: "tyranitar",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/tyranitar/normal.png",
    primaryType: "rock",
    secondaryType: "dark",
  },
  "ursaluna": {
    displaySlug: "ursaluna",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/ursaluna/normal.png",
    primaryType: "ground",
    secondaryType: "normal",
  },
  "vanilluxe": {
    displaySlug: "vanilluxe",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/vanilluxe/normal.png",
    primaryType: "ice",
    secondaryType: null,
  },
  "venusaur": {
    displaySlug: "venusaur",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/venusaur/normal.png",
    primaryType: "grass",
    secondaryType: "poison",
  },
  "victreebel": {
    displaySlug: "victreebel",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/victreebel/normal.png",
    primaryType: "grass",
    secondaryType: "poison",
  },
  "weavile": {
    displaySlug: "weavile",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/weavile/normal.png",
    primaryType: "dark",
    secondaryType: "ice",
  },
  "whimsicott": {
    displaySlug: "whimsicott",
    spriteNormal: "https://yajdmsuvphmdtuxroksv.supabase.co/storage/v1/object/public/pokemon-sprites/whimsicott/normal.png",
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

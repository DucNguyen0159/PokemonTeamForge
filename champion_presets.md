# Champions Strategy Presets — Review Draft (30 teams)

**Status:** Draft v3 — battle plans structured for import (42 plans across 30 teams)  
**Rules applied:** No Legendary, no Mythical on any roster. Mega Evolution only. 66 SP per Pokémon (32 max per stat). No duplicate species or duplicate held items within a team.

**Design mix:** ~70% recognizable meta archetypes, ~30% Champions signature gimmicks (No Guard OHKO, Innards Out, Flower Trick, Last Respects, etc.).

**How to review:** Edit Pokémon, moves, items, SP, or notes directly in this file. When you are happy with the list, tell the agent to import these into `src/data/champions-presets.ts`.

**Legend key**

| Field | Values |
| --- | --- |
| `formatSupport` | `single`, `double`, `both` |
| `accentTheme` | `rain`, `sun`, `trick-room`, `neutral` |
| `difficulty` | `beginner`, `intermediate`, `advanced` |

**SP format:** `HP / Atk / Def / SpA / SpD / Spe` (must sum to 66)

**Battle plan format** (import maps names → roster slots)

Each plan uses **Leads**, **Selected** (3 for Singles / 4 for Doubles — includes leads), **Win**, and **Avoid**. Optional **Bring** lists non-lead selected members.

- `formatSupport: both` teams include **two** plans (Singles + Doubles).
- Import validates: Singles = 1 lead + 3 selected; Doubles = 2 leads + 4 selected.

---

## 1. Rain Balance

| Meta | Value |
| --- | --- |
| **id** | `rain-balance` |
| **formatSupport** | `both` |
| **accentTheme** | `rain` |
| **difficulty** | `intermediate` |
| **styleTags** | Rain, Balance, Mega Swampert |
| **bestFor** | Learning rain pivots in Singles and Doubles |
| **featuredMega** | Swampert — Swampertite |
| **shortDescription** | Flexible rain shell with physical and special closing lines under Drizzle. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Pelipper | Drizzle | Damp Rock | Bold | Hurricane, Weather Ball, Tailwind, Protect | 32/0/20/0/12/2 |
| 2 | Swampert | Swift Swim | Swampertite | Adamant | Waterfall, Earthquake, Ice Punch, Protect | 6/32/0/0/0/28 |
| 3 | Kingdra | Swift Swim | Life Orb | Modest | Hydro Pump, Draco Meteor, Hurricane, Protect | 4/0/0/32/0/30 |
| 4 | Ferrothorn | Iron Barbs | Leftovers | Relaxed | Power Whip, Gyro Ball, Leech Seed, Protect | 32/16/10/0/8/0 |
| 5 | Incineroar | Intimidate | Sitrus Berry | Careful | Flare Blitz, Knock Off, Fake Out, Parting Shot | 28/20/8/0/10/0 |
| 6 | Archaludon | Stamina | Assault Vest | Calm | Flash Cannon, Dragon Pulse, Body Press, Electro Shot | 26/0/20/10/10/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Pelipper, Incineroar
- **Selected:** Pelipper, Incineroar, Swampert, Kingdra
- **Win:** Cycle intimidate + rain, then Mega Swampert or Kingdra sweep.
- **Avoid:** Hard-committing Pelipper into obvious Electric leads.

**Safe Default (Singles)**
- **Lead:** Ferrothorn
- **Selected:** Ferrothorn, Swampert, Kingdra
- **Win:** Set rain with Pelipper off the bench, chip with Ferrothorn, then Mega Swampert or Kingdra closes.
- **Avoid:** Leading Pelipper into fast Electric or Grass pressure.

---

## 2. Sun Pressure

| Meta | Value |
| --- | --- |
| **id** | `sun-pressure` |
| **formatSupport** | `single` |
| **accentTheme** | `sun` |
| **difficulty** | `beginner` |
| **styleTags** | Sun, Offense, Mega Charizard Y |
| **bestFor** | Fast Singles offense with a clear Mega win condition |
| **featuredMega** | Charizard — Charizardite Y |
| **shortDescription** | Fast sun offense with immediate pressure and weather leverage. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Torkoal | Drought | Heat Rock | Bold | Lava Plume, Earth Power, Yawn, Protect | 28/0/16/20/2/0 |
| 2 | Venusaur | Chlorophyll | Life Orb | Timid | Giga Drain, Sludge Bomb, Sleep Powder, Protect | 2/0/0/32/0/32 |
| 3 | Charizard | Solar Power | Charizardite Y | Timid | Heat Wave, Air Slash, Solar Beam, Protect | 4/0/0/32/0/30 |
| 4 | Corviknight | Pressure | Rocky Helmet | Impish | Brave Bird, U-turn, Roost, Iron Head | 32/8/20/0/6/0 |
| 5 | Rillaboom | Grassy Surge | Choice Band | Adamant | Grassy Glide, Wood Hammer, U-turn, Knock Off | 6/32/0/0/0/28 |
| 6 | Cinderace | Libero | Focus Sash | Jolly | Pyro Ball, High Jump Kick, Sucker Punch, Protect | 2/32/0/0/0/32 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Torkoal
- **Selected:** Torkoal, Charizard, Venusaur
- **Win:** Keep sun up and overwhelm with Chlorophyll/Solar Power speed.
- **Avoid:** Letting Torkoal die to free Water switches.

---

## 3. Trick Room Control

| Meta | Value |
| --- | --- |
| **id** | `tr-control` |
| **formatSupport** | `double` |
| **accentTheme** | `trick-room` |
| **difficulty** | `intermediate` |
| **styleTags** | Trick Room, Control, Bulky Offense |
| **bestFor** | Doubles players who want a structured Trick Room game plan |
| **featuredMega** | Chandelure — Chandelurite |
| **shortDescription** | Reliable Trick Room setup with redirection, sleep, and heavy TR punishers. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Hatterene | Magic Bounce | Mental Herb | Quiet | Trick Room, Dazzling Gleam, Mystical Fire, Protect | 32/0/10/16/8/0 |
| 2 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/18/8/0/12/0 |
| 3 | Amoonguss | Regenerator | Rocky Helmet | Sassy | Spore, Pollen Puff, Rage Powder, Protect | 32/0/14/0/20/0 |
| 4 | Conkeldurr | Guts | Flame Orb | Brave | Drain Punch, Mach Punch, Knock Off, Protect | 12/32/8/0/14/0 |
| 5 | Chandelure | Flash Fire | Chandelurite | Quiet | Heat Wave, Shadow Ball, Energy Ball, Protect | 8/0/6/32/20/0 |
| 6 | Dusclops | Frisk | Eviolite | Sassy | Trick Room, Will-O-Wisp, Night Shade, Pain Split | 32/0/32/0/2/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Hatterene, Incineroar
- **Selected:** Hatterene, Incineroar, Conkeldurr, Chandelure
- **Win:** Set TR, deny fast offense with Fake Out/redirection, then sweep with Conkeldurr or Mega Chandelure.
- **Avoid:** Forcing TR into Taunt lines without a Mental Herb plan.

---

## 4. Sand Rush

| Meta | Value |
| --- | --- |
| **id** | `sand-rush` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Sand, Offense, Mega Tyranitar |
| **bestFor** | Aggressive sand teams that want a simple weather + speed plan |
| **featuredMega** | Tyranitar — Tyranitarite |
| **shortDescription** | Sand-setting core with doubled Excadrill and Garchomp pressure. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Tyranitar | Sand Stream | Tyranitarite | Adamant | Stone Edge, Crunch, Earthquake, Protect | 6/32/0/0/0/28 |
| 2 | Excadrill | Sand Rush | Excadrite | Jolly | Earthquake, Iron Head, Rock Slide, Protect | 2/32/0/0/0/32 |
| 3 | Garchomp | Rough Skin | Garchompite | Jolly | Earthquake, Dragon Claw, Stone Edge, Protect | 4/32/0/0/0/30 |
| 4 | Hippowdon | Sand Force | Leftovers | Impish | Earthquake, Slack Off, Stealth Rock, Yawn | 32/16/20/0/0/0 |
| 5 | Corviknight | Pressure | Rocky Helmet | Impish | Brave Bird, U-turn, Roost, Iron Head | 32/8/20/0/6/0 |
| 6 | Rotom-Wash | Levitate | Choice Scarf | Timid | Hydro Pump, Volt Switch, Trick, Thunderbolt | 4/0/0/32/0/30 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Hippowdon
- **Selected:** Hippowdon, Tyranitar, Excadrill
- **Win:** Sand chip, then Mega Tyranitar or Excadrill speed under sand.
- **Avoid:** Letting sand expire before sweepers are in position.

**Safe Default (Doubles)**
- **Leads:** Tyranitar, Excadrill
- **Selected:** Tyranitar, Excadrill, Garchomp, Hippowdon
- **Win:** Sand Rush pressure and spread damage from Mega Tyranitar or Garchomp.
- **Avoid:** Losing Tyranitar early and dropping sand before Excadrill acts.

---

## 5. Aurora Veil Snow

| Meta | Value |
| --- | --- |
| **id** | `aurora-veil-snow` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Snow, Aurora Veil, Mega Baxcalibur |
| **bestFor** | Modern snow offense with Veil + screens instead of a slow balance shell |
| **featuredMega** | Baxcalibur — Baxcalibrite |
| **shortDescription** | Ninetales-Alola sets snow and Aurora Veil; Baxcalibur and Weavile punish under Veil + screens. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Ninetales-Alola | Snow Warning | Light Clay | Timid | Aurora Veil, Moonblast, Freeze-Dry, Protect | 2/0/0/32/0/32 |
| 2 | Baxcalibur | Thermal Exchange | Baxcalibrite | Adamant | Glaive Rush, Ice Shard, Earthquake, Protect | 6/32/0/0/0/28 |
| 3 | Weavile | Pressure | Focus Sash | Jolly | Triple Axel, Knock Off, Ice Shard, Low Kick | 2/32/0/0/0/32 |
| 4 | Grimmsnarl | Prankster | Light Clay | Impish | Reflect, Light Screen, Spirit Break, Thunder Wave | 32/0/20/0/14/0 |
| 5 | Cloyster | Skill Link | White Herb | Adamant | Icicle Spear, Rock Blast, Shell Smash, Protect | 4/32/0/0/0/30 |
| 6 | Hitmontop | Intimidate | Eject Button | Impish | Close Combat, Fake Out, Rapid Spin, Wide Guard | 32/16/18/0/0/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Ninetales-Alola, Grimmsnarl
- **Selected:** Ninetales-Alola, Grimmsnarl, Baxcalibur, Weavile
- **Win:** Stack Aurora Veil and screens, then Mega Baxcalibur or Weavile cleanup.
- **Avoid:** Letting Veil expire before committing a sweeper.

**Safe Default (Singles)**
- **Lead:** Ninetales-Alola
- **Selected:** Ninetales-Alola, Baxcalibur, Weavile
- **Win:** Aurora Veil turn one, then Glaive Rush or Ice Shard pressure under snow.
- **Avoid:** Leading Baxcalibur into unfavorable priority matchups before Veil is up.

---

## 6. Mega Greninja Lead

| Meta | Value |
| --- | --- |
| **id** | `mega-greninja-lead` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Hyper Offense, Mega Greninja, Momentum |
| **bestFor** | Experienced Doubles players who like fast pivot chains |
| **featuredMega** | Greninja — Greninjite |
| **shortDescription** | Protean-style pressure with a Mega finisher and strong pivot support. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Greninja | Protean | Greninjite | Timid | Hydro Pump, Dark Pulse, Ice Beam, Protect | 2/0/0/32/0/32 |
| 2 | Staraptor | Intimidate | Staraptite | Jolly | Brave Bird, Close Combat, U-turn, Tailwind | 2/32/0/0/0/32 |
| 3 | Raichu | Lightning Rod | Raichunite X | Timid | Thunderbolt, Surf, Nasty Plot, Protect | 2/0/0/32/0/32 |
| 4 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/20/8/0/10/0 |
| 5 | Amoonguss | Regenerator | Rocky Helmet | Sassy | Spore, Pollen Puff, Rage Powder, Protect | 32/0/14/0/20/0 |
| 6 | Rotom-Wash | Levitate | Safety Goggles | Bold | Hydro Pump, Volt Switch, Will-O-Wisp, Protect | 32/0/16/16/2/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Greninja, Incineroar
- **Selected:** Greninja, Incineroar, Staraptor, Raichu
- **Win:** Immediate special + physical pressure; Mega when shields are down.
- **Avoid:** Wasting Fake Out turns without follow-up damage.

---

## 7. Mega Lucario Screens Blitz

| Meta | Value |
| --- | --- |
| **id** | `mega-lucario-screens-blitz` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Screens, Mega Lucario, Hyper Offense |
| **bestFor** | Players who want Grimmsnarl screens into an explosive Mega Lucario turn |
| **featuredMega** | Lucario — Lucarionite |
| **shortDescription** | Grimmsnarl sets Reflect/Light Screen, then Mega Lucario closes with Close Combat and Extreme Speed — not a generic balance core. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lucario | Justified | Lucarionite | Adamant | Close Combat, Meteor Mash, Extreme Speed, Protect | 4/32/0/0/0/30 |
| 2 | Grimmsnarl | Prankster | Light Clay | Impish | Reflect, Light Screen, Spirit Break, Thunder Wave | 32/0/20/0/14/0 |
| 3 | Garchomp | Rough Skin | Rocky Helmet | Jolly | Earthquake, Dragon Claw, Stealth Rock, Protect | 6/32/0/0/0/28 |
| 4 | Dragapult | Clear Body | Choice Specs | Timid | Draco Meteor, Shadow Ball, U-turn, Flamethrower | 2/0/0/32/0/32 |
| 5 | Ferrothorn | Iron Barbs | Occa Berry | Relaxed | Power Whip, Gyro Ball, Leech Seed, Protect | 32/16/10/0/8/0 |
| 6 | Toxapex | Regenerator | Black Sludge | Bold | Scald, Toxic, Recover, Haze | 32/0/32/0/2/0 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Grimmsnarl
- **Selected:** Grimmsnarl, Lucario, Toxapex
- **Win:** Screens turn one, then Mega Lucario sweep; Toxapex resets setup attempts.
- **Avoid:** Leading Lucario before Reflect/Light Screen are online.

**Safe Default (Doubles)**
- **Leads:** Grimmsnarl, Lucario
- **Selected:** Grimmsnarl, Lucario, Garchomp, Dragapult
- **Win:** Screens turn one, then Mega Lucario or Garchomp burst through weakened targets.
- **Avoid:** Committing Lucario into bad Fighting matchups before screens land.

---

## 8. Mega Gengar Offense

| Meta | Value |
| --- | --- |
| **id** | `mega-gengar-offense` |
| **formatSupport** | `single` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Hyper Offense, Mega Gengar, Ghost |
| **bestFor** | Singles players who want to force trades and punish switches |
| **featuredMega** | Gengar — Gengarite |
| **shortDescription** | Glass-cannon ghost offense with speed control and pursuit of free KOs. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Gengar | Cursed Body | Gengarite | Timid | Shadow Ball, Sludge Bomb, Focus Blast, Protect | 2/0/0/32/0/32 |
| 2 | Dragapult | Clear Body | Choice Specs | Timid | Draco Meteor, Shadow Ball, Flamethrower, U-turn | 2/0/0/32/0/32 |
| 3 | Weavile | Pressure | Choice Band | Jolly | Knock Off, Triple Axel, Ice Shard, Low Kick | 2/32/0/0/0/32 |
| 4 | Meowstic | Prankster | Meowsticite | Bold | Reflect, Light Screen, Psychic, Trick Room | 32/0/16/0/18/0 |
| 5 | Mimikyu | Disguise | Life Orb | Adamant | Shadow Claw, Play Rough, Swords Dance, Shadow Sneak | 4/32/0/0/0/30 |
| 6 | Ribombee | Shield Dust | Focus Sash | Timid | Moonblast, Sticky Web, U-turn, Tailwind | 2/0/0/32/0/32 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Ribombee
- **Selected:** Ribombee, Gengar, Mimikyu
- **Win:** Sticky Web or Tailwind turn one, then Mega Gengar or Mimikyu Swords Dance sweep.
- **Avoid:** Leading Gengar into priority or Choice Scarf revenge killers.

**Screens (Singles)**
- **Lead:** Meowstic
- **Selected:** Meowstic, Gengar, Dragapult
- **Win:** Reflect/Light Screen support, then Mega Gengar special pressure or Dragapult pivoting.
- **Avoid:** Letting Meowstic go down before screens are set.

---

## 9. Mega Gardevoir Doubles

| Meta | Value |
| --- | --- |
| **id** | `mega-gardevoir-doubles` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Doubles, Mega Gardevoir, Fairy |
| **bestFor** | Special-heavy Doubles with Follow Me support |
| **featuredMega** | Gardevoir — Gardevoirite |
| **shortDescription** | Follow Me + Hyper Voice style special offense built around Mega Gardevoir. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Gardevoir | Trace | Gardevoirite | Modest | Hyper Voice, Psyshock, Mystical Fire, Protect | 4/0/0/32/0/30 |
| 2 | Indeedee | Psychic Surge | Focus Sash | Bold | Follow Me, Helping Hand, Dazzling Gleam, Protect | 32/0/16/0/18/0 |
| 3 | Staraptor | Intimidate | Choice Scarf | Jolly | Brave Bird, Close Combat, U-turn, Tailwind | 2/32/0/0/0/32 |
| 4 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/20/8/0/10/0 |
| 5 | Azumarill | Huge Power | Assault Vest | Adamant | Aqua Jet, Play Rough, Liquidation, Protect | 6/32/0/0/0/28 |
| 6 | Amoonguss | Regenerator | Rocky Helmet | Sassy | Spore, Pollen Puff, Rage Powder, Protect | 32/0/14/0/20/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Indeedee, Gardevoir
- **Selected:** Indeedee, Gardevoir, Incineroar, Azumarill
- **Win:** Follow Me redirection into Mega Gardevoir special burst.
- **Avoid:** Letting Indeedee die before Gardevoir gets a protected attacking turn.

---

## 10. Mega Victreebel Innards Out

| Meta | Value |
| --- | --- |
| **id** | `mega-victreebel-innards-out` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Meme, Trade, Mega Victreebel |
| **bestFor** | Players who want chaotic "take me out and you die too" trades |
| **featuredMega** | Victreebel — Victreebelite |
| **shortDescription** | Mega Victreebel with Innards Out — aim to get KO'd for massive return damage, then sweep with partners. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Victreebel | Chlorophyll | Victreebelite | Modest | Sludge Bomb, Strength Sap, Sleep Powder, Protect | 4/0/0/32/0/30 |
| 2 | Garchomp | Rough Skin | Rocky Helmet | Jolly | Earthquake, Dragon Claw, Stealth Rock, Protect | 6/32/0/0/0/28 |
| 3 | Ceruledge | Flash Fire | Choice Band | Adamant | Bitter Blade, Shadow Sneak, Close Combat, Protect | 4/32/0/0/0/30 |
| 4 | Basculegion | Swift Swim | Choice Band | Adamant | Last Respects, Wave Crash, Flip Turn, Protect | 4/32/0/0/0/30 |
| 5 | Grimmsnarl | Prankster | Light Clay | Impish | Reflect, Light Screen, Spirit Break, Thunder Wave | 32/0/20/0/14/0 |
| 6 | Corviknight | Pressure | Leftovers | Impish | Brave Bird, U-turn, Roost, Iron Head | 32/8/20/0/6/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Victreebel, Grimmsnarl
- **Selected:** Victreebel, Grimmsnarl, Ceruledge, Garchomp
- **Win:** Stack screens, force a big hit into Victreebel for Innards Out value, then Ceruledge/Garchomp cleanup.
- **Avoid:** Protecting Victreebel when you need it to take a KO for Innards Out damage.

---

## 11. Mega Charizard X Dragon Dance

| Meta | Value |
| --- | --- |
| **id** | `mega-charizard-x-dd` |
| **formatSupport** | `single` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Dragon Dance, Physical Offense, Mega Charizard X |
| **bestFor** | Singles players who want a standalone physical Dragon/Fire sweeper (no sun setter) |
| **featuredMega** | Charizard — Charizardite X |
| **shortDescription** | Dragon Dance Charizard X offense with dragon partners — not tied to sun setting. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Charizard | Blaze | Charizardite X | Jolly | Flare Blitz, Dragon Claw, Earthquake, Dragon Dance | 4/32/0/0/0/30 |
| 2 | Haxorus | Mold Breaker | Choice Scarf | Jolly | Outrage, Earthquake, Iron Head, Poison Jab | 2/32/0/0/0/32 |
| 3 | Garchomp | Rough Skin | Rocky Helmet | Jolly | Earthquake, Dragon Claw, Stealth Rock, Protect | 6/32/0/0/0/28 |
| 4 | Corviknight | Pressure | Leftovers | Impish | Brave Bird, U-turn, Roost, Iron Head | 32/8/20/0/6/0 |
| 5 | Aegislash | Stance Change | Leftovers | Quiet | King’s Shield, Shadow Ball, Sacred Sword, Iron Head | 32/0/16/16/2/0 |
| 6 | Gastrodon | Storm Drain | Leftovers | Calm | Earth Power, Ice Beam, Recover, Protect | 32/0/16/0/18/0 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Garchomp
- **Selected:** Garchomp, Charizard, Haxorus
- **Win:** Stealth Rock or pivot chip, Dragon Dance on Charizard X when safe, Haxorus or Gastrodon for mid-game.
- **Avoid:** Setting up Charizard into live Ice Shard or Rock-type pressure.

---

## 12. Gholdengo & Mega Floette

| Meta | Value |
| --- | --- |
| **id** | `gholdengo-mega-floette` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Balance, Fairy, Goodstuff |
| **bestFor** | Strong meta goodstuff without committing to weather |
| **featuredMega** | Floette — Floettite |
| **shortDescription** | Tournament-style balance with Gholdengo + Mega Floette special pressure and Milotic defensive backbone. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Floette | Flower Veil | Floettite | Timid | Dazzling Gleam, Draining Kiss, Calm Mind, Protect | 2/0/0/32/0/32 |
| 2 | Gholdengo | Good as Gold | Choice Specs | Modest | Make It Rain, Shadow Ball, Trick, Protect | 4/0/0/32/0/30 |
| 3 | Milotic | Marvel Scale | Leftovers | Bold | Scald, Ice Beam, Recover, Haze | 32/0/16/0/18/0 |
| 4 | Whimsicott | Prankster | Focus Sash | Timid | Tailwind, Moonblast, Encore, Protect | 2/0/0/32/0/32 |
| 5 | Basculegion | Swift Swim | Choice Band | Adamant | Last Respects, Wave Crash, Flip Turn, Protect | 4/32/0/0/0/30 |
| 6 | Garchomp | Rough Skin | Rocky Helmet | Jolly | Earthquake, Dragon Claw, Stealth Rock, Protect | 6/32/0/0/0/28 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Whimsicott, Floette
- **Selected:** Whimsicott, Floette, Gholdengo, Milotic
- **Win:** Tailwind into Make It Rain / Dazzling Gleam spam; Milotic mops up and resets setup.
- **Avoid:** Committing Floette before Tailwind or redirection is secured.

---

## 13. No Guard OHKO Master

| Meta | Value |
| --- | --- |
| **id** | `no-guard-ohko-master` |
| **formatSupport** | `double` |
| **accentTheme** | `trick-room` |
| **difficulty** | `advanced` |
| **styleTags** | OHKO, Mega Hawlucha, Champions Signature |
| **bestFor** | The definitive Champions gimmick — one team, three OHKO moves |
| **featuredMega** | Hawlucha — Hawluchanite |
| **shortDescription** | Mega Hawlucha Entrainments No Guard onto Snorlax (Fissure), Excadrill (Horn Drill), or Vanilluxe (Sheer Cold). Sinistcha provides TR, Rage Powder, and Hospitality healing. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Hawlucha | Limber | Hawluchanite | Jolly | Entrainment, Close Combat, Brave Bird, Protect | 2/32/0/0/0/32 |
| 2 | Snorlax | Thick Fat | Leftovers | Careful | Fissure, Body Press, Stockpile, Protect | 32/0/32/0/2/0 |
| 3 | Excadrill | Sand Rush | Focus Sash | Jolly | Horn Drill, Earthquake, Iron Head, Protect | 2/32/0/0/0/32 |
| 4 | Vanilluxe | Snow Warning | Choice Scarf | Timid | Sheer Cold, Blizzard, Freeze-Dry, Protect | 2/0/0/32/0/32 |
| 5 | Sinistcha | Hospitality | Kasib Berry | Bold | Trick Room, Matcha Gotcha, Rage Powder, Protect | 32/0/16/0/18/0 |
| 6 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/20/8/0/10/0 |

### Battle plans

**Fast OHKO (Doubles)**
- **Leads:** Hawlucha, Excadrill
- **Selected:** Hawlucha, Excadrill, Vanilluxe, Incineroar
- **Win:** Entrainment No Guard onto the OHKO partner, then Horn Drill/Sheer Cold/Fissure — swap Excadrill for Snorlax vs grounded targets.
- **Avoid:** Using OHKO before Entrainment lands or into Protect/Detect.

**TR OHKO (Doubles)**
- **Leads:** Sinistcha, Snorlax
- **Selected:** Sinistcha, Snorlax, Hawlucha, Incineroar
- **Win:** Trick Room + Rage Powder, Entrainment onto Snorlax, then Fissure under reversed speed.
- **Avoid:** Leading Hawlucha into priority that breaks the TR setup turn.

---

## 14. PsySpam

| Meta | Value |
| --- | --- |
| **id** | `psyspam` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | PsySpam, Expanding Force, Mega Alakazam |
| **bestFor** | Classic psychic terrain offense with Follow Me support |
| **featuredMega** | Alakazam — Alakazite |
| **shortDescription** | Indeedee sets Psychic Terrain; Mega Alakazam and Armarouge explode with Expanding Force and special pressure. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Indeedee | Psychic Surge | Focus Sash | Bold | Follow Me, Helping Hand, Expanding Force, Protect | 32/0/16/0/18/0 |
| 2 | Alakazam | Magic Guard | Alakazite | Timid | Expanding Force, Psyshock, Shadow Ball, Protect | 2/0/0/32/0/32 |
| 3 | Armarouge | Flash Fire | Life Orb | Modest | Expanding Force, Heat Wave, Aura Sphere, Protect | 4/0/0/32/0/30 |
| 4 | Farigiraf | Armor Tail | Sitrus Berry | Calm | Trick Room, Psychic, Helping Hand, Protect | 32/0/10/0/24/0 |
| 5 | Gardevoir | Trace | Choice Scarf | Timid | Moonblast, Psyshock, Mystical Fire, Protect | 2/0/0/32/0/32 |
| 6 | Incineroar | Intimidate | Safety Goggles | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/20/8/0/10/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Indeedee, Alakazam
- **Selected:** Indeedee, Alakazam, Armarouge, Farigiraf
- **Win:** Expanding Force under Psychic Terrain; Farigiraf for TR backup vs faster teams.
- **Avoid:** Letting terrain expire before Mega Alakazam gets a big turn.

---

## 15. Meowscarada Flower Trick

| Meta | Value |
| --- | --- |
| **id** | `meowscarada-flower-trick` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Flower Trick, Choice Scarf, Revenge Killer |
| **bestFor** | High-level balance with guaranteed crit Flower Trick pressure |
| **featuredMega** | Scizor — Scizorite |
| **shortDescription** | Choice Scarf Meowscarada punishes with always-crit Flower Trick; pivots into Gallade and Mega Scizor cleanup. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Meowscarada | Protean | Choice Scarf | Jolly | Flower Trick, U-turn, Knock Off, Triple Axel | 2/32/0/0/0/32 |
| 2 | Gastrodon | Storm Drain | Leftovers | Calm | Earth Power, Ice Beam, Recover, Protect | 32/0/16/0/18/0 |
| 3 | Gholdengo | Good as Gold | Choice Specs | Modest | Make It Rain, Shadow Ball, Trick, Protect | 4/0/0/32/0/30 |
| 4 | Gallade | Steadfast | Choice Band | Adamant | Close Combat, Psycho Cut, Knock Off, Protect | 4/32/0/0/0/30 |
| 5 | Tinkaton | Mold Breaker | Assault Vest | Careful | Gigaton Hammer, Play Rough, Knock Off, Protect | 28/20/8/0/10/0 |
| 6 | Scizor | Technician | Scizorite | Adamant | Bullet Punch, U-turn, Swords Dance, Protect | 4/32/0/0/0/30 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Gastrodon
- **Selected:** Gastrodon, Meowscarada, Scizor
- **Win:** U-turn/Flower Trick momentum into Gallade or Mega Scizor endgame.
- **Avoid:** Locking Choice Scarf Meowscarada into a resisted Flower Trick.

**Safe Default (Doubles)**
- **Leads:** Meowscarada, Gastrodon
- **Selected:** Meowscarada, Gastrodon, Scizor, Gholdengo
- **Win:** Flower Trick picks and U-turn pressure into Mega Scizor or Make It Rain cleanup.
- **Avoid:** Leading Meowscarada into double-target Fire or Fighting pressure.

---

## 16. Basculegion Last Respects

| Meta | Value |
| --- | --- |
| **id** | `basculegion-last-respects` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Last Respects, Choice Scarf, Late Game |
| **bestFor** | Satisfying cleaner that grows stronger as allies faint |
| **featuredMega** | Gengar — Gengarite |
| **shortDescription** | Sacrifice-friendly doubles — faint partners to power Basculegion's Last Respects and Wave Crash. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Basculegion | Swift Swim | Choice Scarf | Adamant | Last Respects, Wave Crash, Flip Turn, Protect | 2/32/0/0/0/32 |
| 2 | Grimmsnarl | Prankster | Light Clay | Impish | Reflect, Light Screen, Spirit Break, Thunder Wave | 32/0/20/0/14/0 |
| 3 | Sinistcha | Hospitality | Kasib Berry | Bold | Matcha Gotcha, Rage Powder, Strength Sap, Protect | 32/0/16/0/18/0 |
| 4 | Ursaluna | Guts | Flame Orb | Brave | Facade, Headlong Rush, Protect, Crunch | 12/32/8/0/14/0 |
| 5 | Gholdengo | Good as Gold | Choice Specs | Modest | Make It Rain, Shadow Ball, Trick, Protect | 4/0/0/32/0/30 |
| 6 | Gengar | Cursed Body | Gengarite | Timid | Shadow Ball, Sludge Bomb, Will-O-Wisp, Protect | 2/0/0/32/0/32 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Grimmsnarl, Sinistcha
- **Selected:** Grimmsnarl, Sinistcha, Basculegion, Ursaluna
- **Win:** Trade aggressively — each faint powers Last Respects; screens + Hospitality keep Basculegion healthy.
- **Avoid:** Bringing Basculegion before enough faints are banked.

---

## 17. Mega Scizor Technician Priority

| Meta | Value |
| --- | --- |
| **id** | `mega-scizor-priority` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Priority, Technician, Mega Scizor |
| **bestFor** | Bullet Punch revenge chains — distinct from generic VoltTurn balance |
| **featuredMega** | Scizor — Scizorite |
| **shortDescription** | Technician priority core: Mega Scizor, Breloom, and Weavile punish faster teams after Grimmsnarl support. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Scizor | Technician | Scizorite | Adamant | Bullet Punch, U-turn, Swords Dance, Protect | 4/32/0/0/0/30 |
| 2 | Breloom | Technician | Focus Sash | Jolly | Mach Punch, Bullet Seed, Spore, Protect | 2/32/0/0/0/32 |
| 3 | Weavile | Pressure | Choice Band | Jolly | Knock Off, Triple Axel, Ice Shard, Low Kick | 2/32/0/0/0/32 |
| 4 | Grimmsnarl | Prankster | Light Clay | Impish | Reflect, Light Screen, Spirit Break, Thunder Wave | 32/0/20/0/14/0 |
| 5 | Baxcalibur | Thermal Exchange | Rocky Helmet | Adamant | Glaive Rush, Ice Shard, Earthquake, Protect | 6/32/0/0/0/28 |
| 6 | Gastrodon | Storm Drain | Leftovers | Calm | Earth Power, Ice Beam, Recover, Protect | 32/0/16/0/18/0 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Grimmsnarl
- **Selected:** Grimmsnarl, Breloom, Scizor
- **Win:** Spore or screens, then Mega Scizor Bullet Punch cleanup.
- **Avoid:** Leading Breloom into multi-hit or spread moves that break Focus Sash.

**Safe Default (Doubles)**
- **Leads:** Grimmsnarl, Breloom
- **Selected:** Grimmsnarl, Breloom, Scizor, Weavile
- **Win:** Spore or Reflect/Light Screen, then Bullet Punch and Ice Shard priority chains.
- **Avoid:** Wasting Breloom's sash on a turn where Spore isn't guaranteed.

---

## 18. Loaded Dice Multi-Hit

| Meta | Value |
| --- | --- |
| **id** | `loaded-dice-multihit` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Skill Link, Loaded Dice, Multi-Hit |
| **bestFor** | Extremely fun preset where every slot abuses multi-hit attacks |
| **featuredMega** | Heracross — Heracronite |
| **shortDescription** | Loaded Dice / Skill Link everywhere — Mega Heracross, Baxcalibur, Cloyster, Cinccino, Breloom, and Maushold. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Heracross | Guts | Heracronite | Adamant | Pin Missile, Close Combat, Rock Blast, Protect | 4/32/0/0/0/30 |
| 2 | Baxcalibur | Thermal Exchange | Loaded Dice | Adamant | Scale Shot, Glaive Rush, Ice Shard, Protect | 6/32/0/0/0/28 |
| 3 | Cloyster | Skill Link | White Herb | Adamant | Icicle Spear, Rock Blast, Shell Smash, Protect | 4/32/0/0/0/30 |
| 4 | Cinccino | Skill Link | Wide Lens | Jolly | Bullet Seed, Rock Blast, Tail Slap, U-turn | 2/32/0/0/0/32 |
| 5 | Breloom | Technician | Focus Sash | Jolly | Bullet Seed, Mach Punch, Spore, Protect | 2/32/0/0/0/32 |
| 6 | Maushold | Friend Guard | Wide Lens | Jolly | Population Bomb, Beat Up, Follow Me, Protect | 2/32/0/0/0/32 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Maushold, Breloom
- **Selected:** Maushold, Breloom, Heracross, Baxcalibur
- **Win:** Spore or Follow Me, then stack multi-hit damage under Loaded Dice / Skill Link.
- **Avoid:** Letting Breloom go down before Spore lands.

---

## 19. Dragon Spam

| Meta | Value |
| --- | --- |
| **id** | `dragon-spam` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Dragon, Offense, Mega Salamence |
| **bestFor** | Popular ladder dragon core with mixed physical/special pressure |
| **featuredMega** | Salamence — Salamencite |
| **shortDescription** | Mega Salamence, Garchomp, Dragapult, and Hydreigon stack dragon offense with Corviknight and Gastrodon support. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Salamence | Intimidate | Salamencite | Jolly | Double-Edge, Earthquake, Dragon Dance, Protect | 4/32/0/0/0/30 |
| 2 | Dragapult | Clear Body | Choice Specs | Timid | Draco Meteor, Shadow Ball, Flamethrower, U-turn | 2/0/0/32/0/32 |
| 3 | Garchomp | Rough Skin | Rocky Helmet | Jolly | Earthquake, Dragon Claw, Stealth Rock, Protect | 6/32/0/0/0/28 |
| 4 | Hydreigon | Levitate | Life Orb | Modest | Draco Meteor, Dark Pulse, Flamethrower, Protect | 4/0/0/32/0/30 |
| 5 | Corviknight | Pressure | Leftovers | Impish | Brave Bird, U-turn, Roost, Iron Head | 32/8/20/0/6/0 |
| 6 | Gastrodon | Storm Drain | Leftovers | Calm | Earth Power, Ice Beam, Recover, Protect | 32/0/16/0/18/0 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Garchomp
- **Selected:** Garchomp, Salamence, Dragapult
- **Win:** Stealth Rock chip, then Mega Salamence or Dragapult breaks weakened teams.
- **Avoid:** Leading Salamence into Ice Shard or Fairy-type priority.

**Safe Default (Doubles)**
- **Leads:** Salamence, Garchomp
- **Selected:** Salamence, Garchomp, Dragapult, Hydreigon
- **Win:** Intimidate + mixed dragon offense; Mega Salamence closes after chip.
- **Avoid:** Letting Gastrodon or Corviknight get picked off before dragons are positioned.

---

## 20. Mega Lopunny Doubles

| Meta | Value |
| --- | --- |
| **id** | `mega-lopunny-doubles` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Doubles, Fighting, Mega Lopunny |
| **bestFor** | Fast Doubles with Fake Out + Mega Fighting pressure |
| **featuredMega** | Lopunny — Lopunnite |
| **shortDescription** | Fast doubles core with Fake Out support into Mega Lopunny Fighting coverage. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lopunny | Limber | Lopunnite | Jolly | High Jump Kick, Fake Out, Ice Punch, Protect | 2/32/0/0/0/32 |
| 2 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/20/8/0/10/0 |
| 3 | Staraptor | Intimidate | Choice Scarf | Jolly | Brave Bird, Close Combat, U-turn, Tailwind | 2/32/0/0/0/32 |
| 4 | Indeedee | Psychic Surge | Focus Sash | Bold | Follow Me, Helping Hand, Dazzling Gleam, Protect | 32/0/16/0/18/0 |
| 5 | Amoonguss | Regenerator | Rocky Helmet | Sassy | Spore, Pollen Puff, Rage Powder, Protect | 32/0/14/0/20/0 |
| 6 | Kilowattrel | Wind Power | Focus Sash | Timid | Thunderbolt, Air Slash, Tailwind, Protect | 2/0/0/32/0/32 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Lopunny, Incineroar
- **Selected:** Lopunny, Incineroar, Indeedee, Staraptor
- **Win:** Double Fake Out pressure, then Mega Lopunny breaks Guard teams.
- **Avoid:** Committing Mega Lopunny into Ghost-type Protect stalls.

---

## 21. Sticky Web Hyper Offense

| Meta | Value |
| --- | --- |
| **id** | `sticky-web-ho` |
| **formatSupport** | `single` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Sticky Web, Hyper Offense, Mega Pinsir |
| **bestFor** | Classic web offense that slows opponents then sweeps |
| **featuredMega** | Pinsir — Pinsirite |
| **shortDescription** | Ribombee sets Sticky Web; Mega Pinsir, Gholdengo, and Weavile clean slowed targets. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Ribombee | Shield Dust | Focus Sash | Timid | Sticky Web, Moonblast, U-turn, Tailwind | 2/0/0/32/0/32 |
| 2 | Pinsir | Moxie | Pinsirite | Adamant | Return, Earthquake, Quick Attack, Swords Dance | 4/32/0/0/0/30 |
| 3 | Gholdengo | Good as Gold | Choice Specs | Modest | Make It Rain, Shadow Ball, Trick, Protect | 4/0/0/32/0/30 |
| 4 | Baxcalibur | Thermal Exchange | Rocky Helmet | Adamant | Glaive Rush, Ice Shard, Earthquake, Protect | 6/32/0/0/0/28 |
| 5 | Breloom | Technician | Focus Sash | Jolly | Mach Punch, Bullet Seed, Spore, Protect | 2/32/0/0/0/32 |
| 6 | Weavile | Pressure | Choice Band | Jolly | Knock Off, Triple Axel, Ice Shard, Low Kick | 2/32/0/0/0/32 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Ribombee
- **Selected:** Ribombee, Pinsir, Weavile
- **Win:** Sticky Web turn one, then Swords Dance Pinsir or Breloom Spore into sweep.
- **Avoid:** Letting Ribombee die before Web is set.

---

## 22. Kingambit Supreme Overlord

| Meta | Value |
| --- | --- |
| **id** | `kingambit-supreme-overlord` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Supreme Overlord, Sacrifice, Cleaner |
| **bestFor** | Players who want Kingambit to snowball after allies faint |
| **featuredMega** | Dragonite — Dragoninite |
| **shortDescription** | Deliberately trade into stacked Supreme Overlord boosts, then Kingambit sweeps. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Kingambit | Defiant | Assault Vest | Adamant | Kowtow Cleave, Iron Head, Sucker Punch, Protect | 6/32/0/0/0/28 |
| 2 | Dragonite | Inner Focus | Dragoninite | Adamant | Extreme Speed, Outrage, Earthquake, Fire Punch | 6/32/0/0/0/28 |
| 3 | Porygon2 | Download | Eviolite | Bold | Tri Attack, Ice Beam, Recover, Protect | 32/0/16/16/2/0 |
| 4 | Corviknight | Pressure | Leftovers | Impish | Brave Bird, U-turn, Roost, Iron Head | 32/8/20/0/6/0 |
| 5 | Gholdengo | Good as Gold | Choice Specs | Modest | Make It Rain, Shadow Ball, Trick, Protect | 4/0/0/32/0/30 |
| 6 | Meowscarada | Protean | Focus Sash | Jolly | Flower Trick, U-turn, Knock Off, Triple Axel | 2/32/0/0/0/32 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Meowscarada
- **Selected:** Meowscarada, Porygon2, Kingambit
- **Win:** Trade into Kingambit with 2–3 faints banked for a boosted Supreme Overlord sweep.
- **Avoid:** Bringing Kingambit before allies have fainted.

**Safe Default (Doubles)**
- **Leads:** Meowscarada, Corviknight
- **Selected:** Meowscarada, Corviknight, Kingambit, Dragonite
- **Win:** Sacrifice partners deliberately, then boosted Kingambit or Dragonite cleanup.
- **Avoid:** Leading Kingambit before Supreme Overlord stacks are online.

---

## 23. Mega Kangaskhan Doubles

| Meta | Value |
| --- | --- |
| **id** | `mega-kangaskhan-doubles` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Doubles, Normal, Mega Kangaskhan |
| **bestFor** | Doubles players who want consistent double-hit pressure |
| **featuredMega** | Kangaskhan — Kangaskhanite |
| **shortDescription** | Classic doubles balance with Fake Out + Mega Kangaskhan double hits. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Kangaskhan | Scrappy | Kangaskhanite | Adamant | Fake Out, Double-Edge, Sucker Punch, Protect | 6/32/0/0/0/28 |
| 2 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/20/8/0/10/0 |
| 3 | Indeedee | Psychic Surge | Focus Sash | Bold | Follow Me, Helping Hand, Dazzling Gleam, Protect | 32/0/16/0/18/0 |
| 4 | Amoonguss | Regenerator | Rocky Helmet | Sassy | Spore, Pollen Puff, Rage Powder, Protect | 32/0/14/0/20/0 |
| 5 | Gliscor | Poison Heal | Toxic Orb | Impish | Earthquake, Roost, Toxic, Protect | 32/0/20/0/14/0 |
| 6 | Staraptor | Intimidate | Choice Scarf | Jolly | Brave Bird, Close Combat, U-turn, Tailwind | 2/32/0/0/0/32 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Kangaskhan, Incineroar
- **Selected:** Kangaskhan, Incineroar, Indeedee, Amoonguss
- **Win:** Fake Out + Follow Me support when breaking Guard lines; Mega Kangaskhan double hits.
- **Avoid:** Letting Indeedee die before Kangaskhan gets a protected turn.

---

## 24. Mega Mawile Trick Room

| Meta | Value |
| --- | --- |
| **id** | `mega-mawile-tr` |
| **formatSupport** | `double` |
| **accentTheme** | `trick-room` |
| **difficulty** | `intermediate` |
| **styleTags** | Trick Room, Fairy, Mega Mawile |
| **bestFor** | Trick Room with a bulky Fairy/Fighting Mega sweeper |
| **featuredMega** | Mawile — Mawilite |
| **shortDescription** | Trick Room setup into Mega Mawile's huge single-target power. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Farigiraf | Armor Tail | Mental Herb | Quiet | Trick Room, Psychic, Helping Hand, Protect | 32/0/10/0/24/0 |
| 2 | Indeedee | Psychic Surge | Focus Sash | Bold | Follow Me, Helping Hand, Dazzling Gleam, Protect | 32/0/16/0/18/0 |
| 3 | Mawile | Intimidate | Mawilite | Adamant | Play Rough, Sucker Punch, Iron Head, Protect | 6/32/0/0/0/28 |
| 4 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/18/8/0/12/0 |
| 5 | Amoonguss | Regenerator | Rocky Helmet | Sassy | Spore, Pollen Puff, Rage Powder, Protect | 32/0/14/0/20/0 |
| 6 | Conkeldurr | Guts | Flame Orb | Brave | Drain Punch, Mach Punch, Knock Off, Protect | 12/32/8/0/14/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Farigiraf, Indeedee
- **Selected:** Farigiraf, Indeedee, Mawile, Conkeldurr
- **Win:** TR into Mega Mawile single-target power (distinct setter shell from team 3).
- **Avoid:** Forcing TR without Follow Me or Fake Out support.

---

## 25. Beat Up + Justified

| Meta | Value |
| --- | --- |
| **id** | `beat-up-justified` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Beat Up, Justified, Mega Lucario |
| **bestFor** | Doubles players who enjoy combo turns |
| **featuredMega** | Lucario — Lucarionite |
| **shortDescription** | Whimsicott Beat Up into Lucario for instant Justified boosts, then Mega Lucario or Arcanine cleanup. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Whimsicott | Prankster | Focus Sash | Timid | Beat Up, Tailwind, Moonblast, Protect | 2/0/0/32/0/32 |
| 2 | Lucario | Justified | Lucarionite | Adamant | Close Combat, Extreme Speed, Bullet Punch, Protect | 4/32/0/0/0/30 |
| 3 | Arcanine | Intimidate | Choice Band | Adamant | Flare Blitz, Close Combat, Extreme Speed, Protect | 6/32/0/0/0/28 |
| 4 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/20/8/0/10/0 |
| 5 | Gliscor | Poison Heal | Toxic Orb | Impish | Earthquake, Roost, Toxic, Protect | 32/0/20/0/14/0 |
| 6 | Gholdengo | Good as Gold | Choice Specs | Modest | Make It Rain, Shadow Ball, Trick, Protect | 4/0/0/32/0/30 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Whimsicott, Lucario
- **Selected:** Whimsicott, Lucario, Arcanine, Incineroar
- **Win:** Turn 1 Beat Up Lucario (or Tailwind if slower), Mega Lucario Close Combat next turn.
- **Avoid:** Beat Up into a Lucario that can't survive the follow-up hit.

---

## 26. Hyper Offense Screens

| Meta | Value |
| --- | --- |
| **id** | `hyper-offense-screens` |
| **formatSupport** | `double` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Screens, Hyper Offense, Grimmsnarl |
| **bestFor** | One of the most played offensive styles — screens then burst |
| **featuredMega** | Lucario — Lucarionite |
| **shortDescription** | Grimmsnarl sets Reflect/Light Screen; Lucario, Haxorus, and Garchomp break through under screen pressure. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Grimmsnarl | Prankster | Light Clay | Impish | Reflect, Light Screen, Spirit Break, Thunder Wave | 32/0/20/0/14/0 |
| 2 | Lucario | Justified | Lucarionite | Adamant | Close Combat, Meteor Mash, Extreme Speed, Protect | 4/32/0/0/0/30 |
| 3 | Haxorus | Mold Breaker | Choice Scarf | Jolly | Outrage, Earthquake, Iron Head, Poison Jab | 2/32/0/0/0/32 |
| 4 | Garchomp | Rough Skin | Focus Sash | Jolly | Earthquake, Dragon Claw, Stealth Rock, Protect | 2/32/0/0/0/32 |
| 5 | Weavile | Pressure | Choice Band | Jolly | Knock Off, Triple Axel, Ice Shard, Low Kick | 2/32/0/0/0/32 |
| 6 | Gholdengo | Good as Gold | Choice Specs | Modest | Make It Rain, Shadow Ball, Trick, Protect | 4/0/0/32/0/30 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Grimmsnarl, Garchomp
- **Selected:** Grimmsnarl, Garchomp, Lucario, Haxorus
- **Win:** Screens turn one, then Mega Lucario or Haxorus burst.
- **Avoid:** Leading Garchomp into Ice Shard or Fairy priority before screens are up.

---

## 27. Mega Sableye Stall

| Meta | Value |
| --- | --- |
| **id** | `mega-sableye-stall` |
| **formatSupport** | `single` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Stall, Recovery, Mega Sableye |
| **bestFor** | Players who want to outlast opponents with status and recovery |
| **featuredMega** | Sableye — Sablenite |
| **shortDescription** | Classic stall — Mega Sableye, Blissey, Toxapex, Corviknight, Clodsire, and Gliscor grind opponents down. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Sableye | Prankster | Sablenite | Bold | Will-O-Wisp, Foul Play, Recover, Protect | 32/0/16/0/18/0 |
| 2 | Blissey | Natural Cure | Leftovers | Calm | Seismic Toss, Soft-Boiled, Toxic, Protect | 32/0/16/0/18/0 |
| 3 | Toxapex | Regenerator | Black Sludge | Bold | Scald, Recover, Haze, Toxic Spikes | 32/0/16/0/18/0 |
| 4 | Corviknight | Pressure | Rocky Helmet | Impish | Brave Bird, U-turn, Roost, Iron Head | 32/8/20/0/6/0 |
| 5 | Clodsire | Unaware | Sitrus Berry | Careful | Earthquake, Poison Jab, Recover, Protect | 32/0/8/0/26/0 |
| 6 | Gliscor | Poison Heal | Toxic Orb | Impish | Earthquake, Roost, Toxic, Protect | 32/0/20/0/14/0 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Toxapex
- **Selected:** Toxapex, Corviknight, Sableye
- **Win:** Stack hazards/status, then stall with recovery until the opponent runs out of resources.
- **Avoid:** Letting Sableye or Toxapex get overwhelmed by special sweepers before status is applied.

---

## 28. Mono Ghost

| Meta | Value |
| --- | --- |
| **id** | `mono-ghost` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `advanced` |
| **styleTags** | Mono Ghost, Flavor, Offense |
| **bestFor** | Thematic ghost spam with strong individual tools |
| **featuredMega** | Gengar — Gengarite |
| **shortDescription** | Full ghost roster — Mega Gengar, Dragapult, Ceruledge, Aegislash, Basculegion, and Sinistcha. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Gengar | Cursed Body | Gengarite | Timid | Shadow Ball, Sludge Bomb, Focus Blast, Protect | 2/0/0/32/0/32 |
| 2 | Dragapult | Clear Body | Choice Specs | Timid | Draco Meteor, Shadow Ball, Flamethrower, U-turn | 2/0/0/32/0/32 |
| 3 | Ceruledge | Flash Fire | Choice Band | Adamant | Bitter Blade, Shadow Sneak, Close Combat, Protect | 4/32/0/0/0/30 |
| 4 | Aegislash | Stance Change | Leftovers | Quiet | King’s Shield, Shadow Ball, Sacred Sword, Iron Head | 32/0/16/16/2/0 |
| 5 | Basculegion | Swift Swim | Life Orb | Adamant | Last Respects, Shadow Ball, Wave Crash, Protect | 4/32/0/0/0/30 |
| 6 | Sinistcha | Hospitality | Kasib Berry | Bold | Matcha Gotcha, Strength Sap, Rage Powder, Protect | 32/0/16/0/18/0 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Aegislash
- **Selected:** Aegislash, Gengar, Ceruledge
- **Win:** King's Shield pivoting into Mega Gengar or Ceruledge for ghost coverage wars.
- **Avoid:** Leading Gengar into priority before Aegislash has scouted the matchup.

**Safe Default (Doubles)**
- **Leads:** Sinistcha, Gengar
- **Selected:** Sinistcha, Gengar, Dragapult, Ceruledge
- **Win:** Rage Powder + Hospitality support, then Dragapult or Ceruledge special/physical pressure.
- **Avoid:** Letting Sinistcha go down before Rage Powder redirects a key hit.

---

## 29. Mega Camerupt Trick Room

| Meta | Value |
| --- | --- |
| **id** | `mega-camerupt-tr` |
| **formatSupport** | `double` |
| **accentTheme** | `trick-room` |
| **difficulty** | `beginner` |
| **styleTags** | Trick Room, Fire, Mega Camerupt |
| **bestFor** | Beginner-friendly TR with spread Fire/Ground damage |
| **featuredMega** | Camerupt — Cameruptite |
| **shortDescription** | Oranguru TR setter with Mega Camerupt Eruption — distinct from the Hatterene/Dusclops shell. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Oranguru | Inner Focus | Mental Herb | Quiet | Trick Room, Instruct, Psychic, Protect | 32/0/10/16/8/0 |
| 2 | Camerupt | Solid Rock | Cameruptite | Quiet | Eruption, Heat Wave, Earth Power, Protect | 14/0/12/32/8/0 |
| 3 | Incineroar | Intimidate | Sitrus Berry | Careful | Fake Out, Knock Off, Parting Shot, Flare Blitz | 28/18/8/0/12/0 |
| 4 | Amoonguss | Regenerator | Rocky Helmet | Sassy | Spore, Pollen Puff, Rage Powder, Protect | 32/0/14/0/20/0 |
| 5 | Conkeldurr | Guts | Flame Orb | Brave | Drain Punch, Mach Punch, Knock Off, Protect | 12/32/8/0/14/0 |
| 6 | Indeedee | Psychic Surge | Focus Sash | Bold | Follow Me, Helping Hand, Dazzling Gleam, Protect | 32/0/16/0/18/0 |

### Battle plans

**Safe Default (Doubles)**
- **Leads:** Oranguru, Incineroar
- **Selected:** Oranguru, Incineroar, Camerupt, Conkeldurr
- **Win:** TR → Instruct Camerupt or Eruption spread.
- **Avoid:** Letting Oranguru get Taunted before Trick Room goes up.

---

## 30. Weatherless Balance

| Meta | Value |
| --- | --- |
| **id** | `weatherless-balance` |
| **formatSupport** | `both` |
| **accentTheme** | `neutral` |
| **difficulty** | `intermediate` |
| **styleTags** | Balance, Goodstuff, Mega Metagross |
| **bestFor** | Classic weatherless balance — the backbone of many ladder teams |
| **featuredMega** | Metagross — Metagrossite |
| **shortDescription** | Rotom-Wash, Corviknight, Garchomp, Clefable, Mega Metagross, and Dragonite — no weather required. |

| Slot | Pokémon | Ability | Item | Nature | Moves | SP |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Rotom-Wash | Levitate | Safety Goggles | Bold | Hydro Pump, Volt Switch, Will-O-Wisp, Protect | 32/0/16/16/2/0 |
| 2 | Corviknight | Pressure | Leftovers | Impish | Brave Bird, U-turn, Roost, Iron Head | 32/8/20/0/6/0 |
| 3 | Garchomp | Rough Skin | Rocky Helmet | Jolly | Earthquake, Dragon Claw, Stealth Rock, Protect | 6/32/0/0/0/28 |
| 4 | Clefable | Magic Guard | Sitrus Berry | Bold | Moonblast, Soft-Boiled, Thunder Wave, Protect | 32/0/16/0/18/0 |
| 5 | Metagross | Clear Body | Metagrossite | Adamant | Meteor Mash, Earthquake, Bullet Punch, Protect | 6/32/0/0/0/28 |
| 6 | Dragonite | Inner Focus | Dragoninite | Adamant | Extreme Speed, Outrage, Earthquake, Fire Punch | 6/32/0/0/0/28 |

### Battle plans

**Safe Default (Singles)**
- **Lead:** Rotom-Wash
- **Selected:** Rotom-Wash, Corviknight, Metagross
- **Win:** Pivot into favorable matchups, then Mega Metagross or Dragonite closes.
- **Avoid:** Hard-switching Corviknight into Electric pressure without Volt Switch chip.

**Safe Default (Doubles)**
- **Leads:** Rotom-Wash, Corviknight
- **Selected:** Rotom-Wash, Corviknight, Metagross, Dragonite
- **Win:** Defensive pivots and Intimidate/U-turn cycles, then Mega Metagross or Dragonite endgame.
- **Avoid:** Letting Rotom-Wash get trapped into Grass-type pressure.

---

## Review checklist

Use this when editing:

- [ ] No Legendary or Mythical species on any roster
- [ ] No duplicate species within a team
- [ ] No duplicate held items within a team
- [ ] Each Pokémon SP row sums to **66** (max **32** in any one stat)
- [ ] Mega stones match species (see `src/data/champions-mega-stones.ts`)
- [ ] Moves/abilities are plausible for each species (adjust if you want stricter legality)
- [ ] `formatSupport` matches how you expect the team to be played
- [ ] Battle plans: each has **Leads/Lead**, **Selected** (3 Singles / 4 Doubles), **Win**, **Avoid**
- [ ] `formatSupport: both` teams have both a Singles and Doubles plan

## Archetype coverage summary

| Category | Teams |
| --- | --- |
| Weather (Rain/Sun/Sand/Snow) | 1, 2, 4, 5 |
| Trick Room (3 distinct shells) | 3, 24, 29 |
| **Champions signature gimmicks** | **13** (No Guard OHKO), **10** (Innards Out), **15** (Flower Trick), **16** (Last Respects) |
| Meta archetypes | 14 PsySpam, 17 Technician Priority, 19 Dragon Spam, 21 Sticky Web HO, 26 Screens HO, 12 Goodstuff, 30 Weatherless Balance |
| Fun / flavor | 18 Loaded Dice, 25 Beat Up, 28 Mono Ghost, 22 Supreme Overlord |
| Defensive | 27 Stall |
| Mega showcases | 6–9, 11, 17–18, 20, 23, 27, 30, etc. |

| Difficulty | Teams |
| --- | --- |
| Beginner | 2, 29 |
| Intermediate | 1, 3, 4, 5, 7, 9, 12, 14–17, 19, 22, 24, 26, 30 |
| Advanced | 6, 8, 10, 13, 18, 21, 25, 27, 28 |

| Format | Teams |
| --- | --- |
| Singles-focused | 2, 8, 11, 15, 17, 19, 21, 22, 27, 28, 30 |
| Doubles-focused | 3, 9, 10, 12–14, 16, 18, 20, 24–26, 29 |
| Both | 1, 4–7, 15, 17, 19, 22, 28, 30 |

---

*When your review is complete, say “import champion presets” and the agent will convert this file into `src/data/champions-presets.ts`.*

# Sound Guide — The Hale Dynasty Ambient Soundscapes
## Rec 2: Ambient Audio by Era

This guide lists the specific sounds to download for each era's ambient soundscape. All sounds are available free from **Freesound.org** (create a free account), **BBC Sound Effects Library** (bbcsfx.acropolis.org.uk — free for personal/educational use), or **Pixabay** (no account needed).

---

## Era-Specific Sounds

### Era I — Norman (1066–1150)
**Mood:** Wood smoke, open land, watermills, early medieval England
- `wind_through_trees_medieval.mp3` — light wind through oak woodland
- `watermill_turning.mp3` — slow mill wheel on a river
- `distant_blacksmith.mp3` — hammer on anvil, far away
- `horses_walking_cobble.mp3` — horses on stone
- Search terms on Freesound: **"medieval village ambience"**, **"watermill loop"**, **"wood fire crackle"**

### Era II — The Pestilence (1349–1382)
**Mood:** Quiet village, distant bells, the aftermath of catastrophe
- `church_bell_slow_toll.mp3` — a single deep church bell tolling
- `bees_hive_ambient.mp3` — bees at a hive (close, warm)
- `birds_early_morning.mp3` — birds before dawn, very quiet
- `wind_empty_fields.mp3` — wind across an empty yard
- Search terms: **"plague bell"**, **"medieval church bell"**, **"beehive sound"**, **"empty village"**

### Era III — Tudor (1400–1560)
**Mood:** Busy hall, trade and commerce, quill on parchment
- `quill_on_parchment.mp3` — scratching of a quill writing
- `tudor_fireplace.mp3` — large hall fire crackling
- `market_crowd_distant.mp3` — town market, far away
- `horse_stable.mp3` — horses in a stable, gentle movement
- Search terms: **"quill writing sound"**, **"tudor hall"**, **"16th century market"**

### Era IV — Civil War (1642–1649)
**Mood:** Cannon fire, tension, the sounds of a kingdom at war
- `distant_cannon_fire.mp3` — cannon far away, muffled
- `musket_volley.mp3` — musket fire in the middle distance
- `rain_on_tent.mp3` — rain on canvas, night camp
- `church_bell_oxford.mp3` — Oxford church bells (Christ Church or Merton)
- Search terms: **"civil war cannon"**, **"17th century battle ambience"**, **"rain tent"**

### Era V — Georgian (1720–1741)
**Mood:** Candlelit study, fire, coach wheels on stone, civilised England
- `london_coach_street.mp3` — coach wheels on cobblestones
- `drawing_room_fire.mp3` — fire in a Georgian grate
- `harpsichord_background.mp3` — harpsichord playing quietly in another room
- `rain_sash_window.mp3` — rain on a Georgian sash window
- Search terms: **"georgian period ambience"**, **"london 1700s"**, **"harpsichord ambient"**

### Era VI — Regency (1800–1835)
**Mood:** Estate management, country house, pen on ledger
- `country_house_morning.mp3` — birds, distant dogs, estate sounds
- `ledger_pen_writing.mp3` — pen scratching on paper (accounting)
- `carriage_arriving.mp3` — carriage on gravel drive
- `piano_background.mp3` — pianoforte in the next room
- Search terms: **"regency period"**, **"country estate sounds"**, **"early 19th century"**

### Era VII — Victorian (1870–1882)
**Mood:** Gas lamps, Victorian London, club silence, suppressed unease
- `victorian_london_street.mp3` — horse traffic, distant shouts
- `clock_ticking_mantel.mp3` — mantel clock in a gentleman's study
- `paper_turning.mp3` — pages of a diary being turned
- `rain_london_evening.mp3` — London rain, gas lamp flicker (use visual + rain audio)
- Search terms: **"victorian london ambience"**, **"horse tram"**, **"gentleman's club quiet"**

### Era VIII — WWI / Edwardian (1914–1919)
**Mood:** The front, farmhouse behind the lines, France
- `distant_artillery_ww1.mp3` — artillery in the far distance
- `farmhouse_fire_france.mp3` — fire in a French farmhouse kitchen
- `rain_mud.mp3` — rain on wet ground, no shelter
- `typewriter_background.mp3` — typewriter in a press office
- Search terms: **"world war 1 ambience"**, **"trench sounds"**, **"french countryside"**

### Era IX — WWII / Postwar (1939–1960)
**Mood:** Blitz, then the quiet of peacetime Harlow, 1947
- `air_raid_siren_distant.mp3` — air raid siren, far away
- `blitz_fire_distant.mp3` — distant fire, London
- `postwar_housing_estate.mp3` — children, a radio, new-build quiet
- `bbc_radio_static.mp3` — BBC Radio, 1947-era static and voice
- Search terms: **"blitz sounds"**, **"1940s london"**, **"postwar britain"**, **"1950s radio"**

### Era X — Contemporary (1990–2024)
**Mood:** Oxford, the Bodleian, archive silence, discovery
- `library_quiet.mp3` — almost silent reading room, distant page turns
- `computer_keyboard.mp3` — quiet typing, research
- `bodleian_courtyard.mp3` — Oxford courtyard, pigeons, distant bells
- `imaging_machine.mp3` — multispectral scanner (gentle electronic hum)
- Search terms: **"library ambience"**, **"oxford quiet"**, **"archive room"**, **"research silence"**

---

## Sounds Kennedy Mentioned Specifically

### Church Bells
- **Freesound.org**: Search "church bell toll", "english church bells", "cathedral bell"
- **BBC Sound Effects**: "Church/Cathedral bells" — excellent quality
- Good clips: Single toll (for era-II plague), full peal (for era-I Norman), Oxford chimes (for era-X)

### Bell Sounds (general)
- Handbell (era-I, church use): Search "handbell medieval"
- Sacring bell (Mass, era-I/II): Search "sacring bell"
- Town crier bell (era-III): Search "town crier bell"

### Other Sounds Worth Downloading
- Bees at a hive (essential for era-II / bees.html)
- Quill writing (good for era-III)
- Fire in a hearth (many eras)
- Wind (many eras, each slightly different character)
- Rain on different surfaces (window, canvas, mud, cobblestone)

---

## How to Implement (once sounds are downloaded)

When you're ready to add the sounds, tell me and I will:

1. Upload the sound files to the `/sounds/` folder in the project
2. Add `.era-sound-bar` controls to each era page (the CSS is already partially defined)
3. Wire up the `AudioContext` JavaScript (auto-looping ambient, volume fade on scroll)
4. Add play/pause per-era toggle buttons

**File naming convention to use:**
- `sounds/era-I-ambient.mp3`
- `sounds/era-II-ambient.mp3`
- ...through `sounds/era-X-ambient.mp3`
- `sounds/church-bell-toll.mp3`
- `sounds/church-bells-peal.mp3`
- `sounds/bees-hive.mp3`

---

## Recommended Download Sources

| Source | URL | Notes |
|--------|-----|-------|
| Freesound | freesound.org | Free account needed, huge library |
| BBC Sound Effects | bbcsfx.acropolis.org.uk | Free for personal/research use |
| Pixabay Audio | pixabay.com/sound-effects | No account needed |
| Zapsplat | zapsplat.com | Free with account |

All recommended for non-commercial personal project use. Check individual license before use in anything public-facing.

# Riḥla 983

A pixel-art side-scrolling platformer. An Arab traveller crosses the Islamic world in **983 CE**, from Samanid Bukhara through Abbasid Baghdad, Fatimid Cairo and Qayrawan, to Umayyad Córdoba. Each level ends with a real object from the Metropolitan Museum of Art, shown in pixel form with a museum card. Along the way, the political map splits from one caliph into three.

**Play:** <https://tahay133.github.io/rihla-983/>

Made for MEIS-UA 640 / HIST-UA 542 (Fall 2026). The design handoff is in [`docs/handoff.html`](docs/handoff.html).

## How to play

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move | ← → or A D | D-pad / left stick |
| Jump (hold for higher) | Z, Space or ↑ | A |
| Drop through a wooden ledge | ↓ + Z | down + A |
| Action | X | B / X |
| Confirm, close a museum card | Enter | A |
| Pause | Esc | Start |
| Mute | M | Back |
| Debug overlay | F3 | |

**On a phone, play it sideways.** Held upright, the game pauses and asks you to turn the phone (there's a "Play upright anyway" option). In landscape, buttons appear at the screen edges: ◀ ▶ ▼ on the left, X and Z on the right, and II (pause) at the top right. On browsers that allow it (Android Chrome), ⛶ goes fullscreen and locks landscape. In menus, ◀ ▶ choose and Z confirms. Add `?touch=1` to the URL to show the buttons on a desktop.

You start with 3 hearts. A hazard costs one heart and knocks you back; falling into a pit costs one and returns you to the last checkpoint. With no hearts left, the traveller rests and sets out again from the checkpoint. Nobody dies permanently.

Progress saves in your browser. Refreshing the page and choosing **Continue** returns you to the level and checkpoint you were at. **Reset journey** on the title screen clears it. If the browser blocks storage, the game still runs, but progress lasts only until the tab closes.

## The journey

Each object unlocks something a later level needs.

| # | City in 983 | Who holds power | Banner | Object (The Met) | Unlock |
| --- | --- | --- | --- | --- | --- |
| 1 | Bukhara → Samarkand road | Samanid amirs, who recognise the Abbasid caliph | black | [Samanid epigraphic bowl](https://www.metmuseum.org/toah/works-of-art/40.170.15) | Blessing: +1 max heart |
| 2 | Baghdad | Abbasid caliph in name; Buyid amirs in control since 945 | black | [Luster bowl with four camels](https://www.metmuseum.org/art/collection/search/451768) | Luster Glint: hidden shimmering platforms appear |
| 3 | Cairo | Fatimid caliph al-ʿAzīz (r. 975–96) | white | [Tiraz veil naming al-ʿAzīz](https://www.metmuseum.org/art/collection/search/452271) | Robe of Honor: Fatimid gates open |
| 4 | Qayrawan | Zirid governors ruling for the Fatimid caliph | white | [Folio from the Blue Qur'an](https://www.metmuseum.org/art/collection/search/454662) | Gold Light: lights dark halls |
| 5 | Córdoba | Umayyad caliph Hishām II; al-Manṣūr holds real power | red | [Ivory pyxis](https://www.metmuseum.org/art/collection/search/471973) | Journey complete: the vitrine ending |

- **Bukhara:** a tutorial. Camel caravans are moving platforms, scorpions patrol, dust gusts push you back (camel riders are sheltered).
- **Baghdad:** market awnings bounce you onto rooftops, melons roll from upset carts, the Round City gate is the mid-level checkpoint, and round guffa boats cross the Tigris.
- **Cairo:** feluccas cross the Nile (the far banks are too high to climb from the water). The Fatimid palace wall can only be climbed on luster platforms, so you can't finish without Luster Glint.
- **Qayrawan:** a night level. Gold letters mark the safe stones; the rest crumble. Two Fatimid gates open only for the Robe of Honor. Swim an Aghlabid basin, then climb inside the three-tier minaret to get over the mosque's wall.
- **Córdoba:** Umayyad guards recognise the Fatimid robe and give chase. The Great Mosque's hypostyle hall is dark, and only Gold Light lets you in. Then the Roman bridge, and the terraces of Madinat al-Zahra up to the pyxis.

## Museum cards

The card shows the object's sprite, title, date, place, Met accession number, where to see it, a link to the Met page, and the unlock.

**Course note.** If any of this is submitted for MEIS-UA 640, the syllabus requires the writing to be in your own voice. Each object's `cardText` in [`src/data/gameData.js`](src/data/gameData.js) is intentionally empty for you to write. While it is empty, the card shows the `facts` bullets, which are research notes paraphrased from the Met object pages, not finished captions. As soon as `cardText` has text, the card shows it instead.

## Accuracy

The year is 983, so anything built later is left out:

- Bukhara & Samarkand: no Registan, Gur-e Amir or Bibi-Khanym (Timurid, 14th–15th c.), and no turquoise or ribbed domes.
- Baghdad: no intact Green Dome (it collapsed in 941), no Mustanṣiriyya madrasa (13th c.), no Ottoman domes or pencil minarets.
- Cairo: no Mosque of al-Ḥākim (begun 990), no Bāb Zuwayla or Badr al-Jamālī's stone gates (late 11th c.), no Citadel (12th c.), no Mamluk domes or minarets. The Mosque of Ibn Ṭūlūn appears without its spiral minaret, which is a rebuild of 1296.
- Qayrawan: no Ottoman pencil minarets and no later white-domed zawiyas.
- Córdoba: no Alhambra, no cathedral inside the mosque, and not al-Manṣūr's 987 extension.

### Artistic license

- **Samarra's spiral minaret** (completed 851) is far north of Baghdad. It appears only as a distant silhouette in the Baghdad level, labelled "artistic license" in the game and in the credits.
- **Córdoba's red banners:** older sources give the Umayyads white. Recent scholarship (Maribel Fierro) links the Andalusi Umayyads with red, and red keeps the three caliphates visually distinct.
- **The Blue Qur'an sprite** shows 5 gold lines; the real page has 15.
- **The camel bowl sprite** shows one camel; the real bowl has four.
- **On the in-game museum card the sprite is drawn ×6**, not the ×8 of the handoff page, so all three facts fit at 8 px on the 320×180 screen.
- The objects are simplified pixel homages. No Met photographs are used; the cards link to the object pages instead.

### Where each claim comes from

Every historical line in the game comes from `docs/handoff.html` (game data, landmark lists and guardrails). The handoff's sources:

| Claim in the game | Source |
| --- | --- |
| Object titles, dates, places, accession numbers, galleries, facts | The Met object pages linked above |
| Samanids recognise the Abbasid caliph; Buyids hold real power in Baghdad | Met object pages (Samanid bowl, luster bowl) |
| Samanid Mausoleum (far backdrop, Bukhara) | [Smarthistory](https://smarthistory.org/samanid-mausoleum-bukhara-uzbekistan) |
| Green Dome collapsed in 941 | [Palace of the Golden Gate](https://en.wikipedia.org/wiki/Palace_of_the_Golden_Gate) |
| Ibn Ṭūlūn (876–79); its spiral is a 1296 rebuild | [Archnet](https://archnet.org/sites/1522) |
| Cairo founded 969, Fatimid caliph al-ʿAzīz, Fatimids rose in North Africa in 909 | [The Met: Fatimid period](https://www.metmuseum.org/essays/the-art-of-the-fatimid-period-909-1171) |
| Tiraz as a sign of loyalty and honour (the Robe of Honor) | [The Met: Tiraz](https://www.metmuseum.org/toah/hd/tira/hd_tira.htm) |
| Great Mosque of Kairouan: buttressed walls, square three-tier minaret | [Patrimoine de Tunisie](https://patrimoinedetunisie.com.tn/en/monuments/the-great-mosque-of-kairouan) |
| Córdoba's arches, al-Ḥakam II's mihrab (961–76), no 987 extension | [Archnet](https://archnet.org/sites/2715) |
| ʿAbd al-Raḥmān III's minaret (951–52) with gold and silver spheres | [Arte en Córdoba](https://www.artencordoba.com/en/mosque-cordoba/the-mosque/works-abd-al-rahman-iii/) |
| Hishām II and al-Manṣūr; three caliphs by 983; Madinat al-Zahra | [The Met: Umayyad Spain](https://www.metmuseum.org/essays/the-art-of-the-umayyad-period-in-spain-711-1031) |
| Banner colours | [Islamic flag](https://en.wikipedia.org/wiki/Islamic_flag); Fierro on Umayyad red, cited in a MESA abstract on Fatimid colour symbolism |

A few landmark details are stated in the handoff without a linked source: the Round City's dates (762–66), the al-Karkh markets, the Buyids' date (945), the Arab-Ata Mausoleum (977–78), Samarra's minaret (851), the Aghlabid basins and al-Manṣūriyya (947). They carry `TODO(history)` notes in the level files so a citation can be added.

## Run locally

It is a static site with no build step:

```bash
python3 -m http.server 8983
```

Then open <http://localhost:8983>.

## Single-file build (itch.io)

```bash
node tools/build-itch.mjs
```

This inlines all the JavaScript and CSS into `dist/rihla-983-itch.html` (also written as `dist/index.html`). Upload it to itch.io as an HTML project played in the browser, or open it directly to play offline. It needs no dependencies, and `dist/` is not committed.

## Project layout

```
index.html, style.css
docs/handoff.html           design handoff (source of the art code and game data)
src/main.js                 boot + state machine (title → map → level → card → … → vitrine → credits)
src/engine/                 screen, loop, input, physics, camera, audio, debug
src/art/                    palette, sprites, backdrops (verbatim from the handoff, then extended), tiles, layers, decor, font
src/data/                   gameData.js (handoff JSON), credits.js
src/game/                   player, world (tilemap legend), platforms, hazards, items, level, save
src/levels/                 level1.js … level5.js (string-row tilemaps), test.js (engine test room)
src/ui/                     title, map, card, vitrine, credits, hud, touch
```

Level maps are rows of characters; the legend is at the top of [`src/game/world.js`](src/game/world.js).

**Dev shortcuts** (with the F3 overlay on): `1`–`5` start a level with the earlier unlocks, `T` opens the engine test room, `G` grants every object.

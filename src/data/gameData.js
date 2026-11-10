// Game data, copied unchanged from the #game-data JSON in docs/handoff.html.
// Do not add historical claims here; leave a TODO(history) comment instead.
export default {
  "title": "Riḥla 983",
  "year": 983,
  "internalResolution": [320, 180],
  "tileSize": 16,
  "startHearts": 3,
  "levels": [
    {
      "id": "L1",
      "name": "Bukhara & the Samarkand Road",
      "region": "Transoxania (Mā warāʾ al-nahr)",
      "power": "Samanid amirs, who recognise the Abbasid caliph",
      "banner": "#141018",
      "bannerNote": "Abbasid black (the Samanids acknowledge Baghdad)",
      "backdrop": "bukhara",
      "palette": ["#2a1f3d", "#7c4658", "#e5a15e", "#b27b46", "#7a5232", "#3b2630"],
      "landmarks": [
        "Samanid Mausoleum, Bukhara (late 9th–early 10th c.): baked-brick cube, basket-weave brickwork, a large dome and four small corner cupolas",
        "Arab-Ata Mausoleum near Samarkand (dated 977–78): same Samanid brick style, brand new in 983",
        "Mud-brick citadel walls and towers",
        "Zarafshan mountains at dusk; Silk Road camel caravans"
      ],
      "avoid": [
        "Registan, Gur-e Amir, Bibi-Khanym (Timurid, 14th–15th c.)",
        "Turquoise-tiled or ribbed domes of any kind"
      ],
      "mechanics": [
        "Tutorial: run, jump, drop through one-way ledges",
        "Camel caravan as slow-moving platforms",
        "Scorpions patrol the sand; dust gusts push the player back"
      ],
      "item": "bowl-samanid"
    },
    {
      "id": "L2",
      "name": "Baghdad, City of Peace",
      "region": "Iraq",
      "power": "Abbasid caliph in name; Buyid amirs control Baghdad since 945",
      "banner": "#141018",
      "bannerNote": "Abbasid black",
      "backdrop": "baghdad",
      "palette": ["#6aa3c2", "#e6e0bf", "#c9a46b", "#3d7d8c", "#a5874f", "#3f6b3a"],
      "landmarks": [
        "Round City walls, towers and gates (built 762–66)",
        "The Tigris with round guffa boats; date palms on the banks",
        "Markets of al-Karkh outside the Round City",
        "Distant spiral minaret of Samarra (completed 851). It is well north of Baghdad: label it as artistic license"
      ],
      "avoid": [
        "The Green Dome of the caliph's palace, intact (collapsed 941)",
        "Mustanṣiriyya madrasa (13th c.), Ottoman domes and pencil minarets"
      ],
      "mechanics": [
        "Guffa boats drift on the Tigris as moving platforms",
        "Market awnings bounce the player higher",
        "Rolling melons from upset carts; the Round City gate is the mid-level checkpoint"
      ],
      "item": "bowl-camels"
    },
    {
      "id": "L3",
      "name": "Cairo, the Victorious",
      "region": "Egypt",
      "power": "Fatimid caliph al-ʿAzīz (r. 975–96)",
      "banner": "#ffffff",
      "bannerNote": "Fatimid white, chosen against Abbasid black",
      "backdrop": "cairo",
      "palette": ["#e39a45", "#f7e4b3", "#d6b06a", "#3a7d84", "#c49d63", "#e3c893"],
      "landmarks": [
        "Al-Azhar mosque (founded with the city, 969–73): arcades and crenellations",
        "Pyramids of Giza across the Nile",
        "Nile feluccas with lateen sails",
        "Mosque of Ibn Ṭūlūn (876–79), but without its spiral minaret (see guardrails)",
        "White Fatimid banners on palace walls"
      ],
      "avoid": [
        "Mosque of al-Ḥākim (begun 990)",
        "Bāb Zuwayla and Badr al-Jamālī's stone gates (late 11th c.)",
        "Saladin's Citadel (12th c.); Mamluk domes and minarets"
      ],
      "mechanics": [
        "Feluccas ride the Nile current",
        "Hidden luster platforms appear only with Luster Glint (from L2)",
        "Palace guards patrol: touching one means knockback, not death"
      ],
      "item": "tiraz-veil"
    },
    {
      "id": "L4",
      "name": "Qayrawan by Night",
      "region": "Ifrīqiya (Tunisia)",
      "power": "Zirid governors ruling for the Fatimid caliph in Cairo",
      "banner": "#ffffff",
      "bannerNote": "Fatimid white",
      "backdrop": "qayrawan",
      "palette": ["#0a0f2e", "#1c2766", "#a8946a", "#8d7852", "#2a3a8a", "#e8c45a"],
      "landmarks": [
        "Great Mosque of Kairouan: fortress-like buttressed walls (final Aghlabid form, 836)",
        "Its square, three-tier minaret, one of the oldest minarets still standing",
        "Aghlabid basins: huge round 9th-century reservoirs",
        "Al-Manṣūriyya, the Fatimids' round palace-city (founded 947), on the horizon"
      ],
      "avoid": [
        "Ottoman pencil minarets",
        "Later white-domed zawiyas (e.g. 19th c.)"
      ],
      "mechanics": [
        "Night palette: gold letters on the ground mark the safe path",
        "Fatimid gates open only with the Robe of Honor",
        "Climb the three-tier minaret; swim slowly across the basin"
      ],
      "item": "blue-quran"
    },
    {
      "id": "L5",
      "name": "Córdoba, the Third Caliphate",
      "region": "al-Andalus",
      "power": "Umayyad caliph Hishām II; the chamberlain al-Manṣūr holds real power (978–1002)",
      "banner": "#b3261e",
      "bannerNote": "Umayyad red (see note in section 2)",
      "backdrop": "cordoba",
      "palette": ["#ee9f68", "#fae7c4", "#d9b47c", "#a33a2a", "#efe0c0", "#4c7f8e"],
      "landmarks": [
        "Great Mosque: horseshoe arches with red-brick and white-stone voussoirs, an Umayyad signature that echoes the Dome of the Rock",
        "ʿAbd al-Raḥmān III's square minaret (951–52), crowned with gold and silver spheres",
        "Al-Ḥakam II's extension and mihrab (961–76)",
        "Roman bridge over the Guadalquivir",
        "Madinat al-Zahra's terraces on the Sierra Morena slopes"
      ],
      "avoid": [
        "The Alhambra (Nasrid Granada, 13th–15th c.)",
        "The cathedral built inside the mosque (16th c.)",
        "Al-Manṣūr's mosque extension (987, four years in the future)"
      ],
      "mechanics": [
        "Umayyad guards recognise the Fatimid Robe: short chase sequence",
        "Dark hypostyle 'forest' of red-white arches; Gold Light shows the way",
        "Cross the Roman bridge, then climb Madinat al-Zahra's terraces to the pyxis"
      ],
      "item": "pyxis"
    }
  ],
  "items": [
    {
      "id": "bowl-samanid",
      "sprite": "bowlSamanid",
      "title": "Bowl with Arabic Inscription, \"Blessing, Prosperity, Well-being, Happiness\"",
      "date": "late 10th–11th century",
      "place": "Probably Samarqand (Uzbekistan); excavated at Nishapur (Iran)",
      "accession": "40.170.15",
      "url": "https://www.metmuseum.org/toah/works-of-art/40.170.15",
      "where": "The Met Fifth Avenue, Gallery 453 (check before visiting)",
      "facts": [
        "A Samanid 'epigraphic ware': Arabic calligraphy is the main decoration.",
        "Found at Nishapur in 1939 by the Met's own excavation, but attributed to Samarkand. The bowl was a traveller too.",
        "The Samanids ruled Transoxania from Bukhara while recognising the Abbasid caliph."
      ],
      "cardText": "",
      "unlock": "Blessing: +1 maximum heart for the rest of the journey",
      "spriteNote": "Black strokes on white slip stand in for the kufic band."
    },
    {
      "id": "bowl-camels",
      "sprite": "bowlCamels",
      "title": "Luster Bowl with Four Camels",
      "date": "10th century",
      "place": "Attributed to Iraq",
      "accession": "see Met page",
      "url": "https://www.metmuseum.org/art/collection/search/451768",
      "where": "The Met Fifth Avenue, Gallery 451",
      "facts": [
        "Luster, a metallic shimmer fired onto the glaze, was a 9th-century innovation of Iraq-based potters.",
        "Abbasid luster bowls showed birds, mythical beasts, people and plants. This one shows four camels.",
        "In 983 the caliph still lived in Baghdad, but the Buyid amirs held real power."
      ],
      "cardText": "",
      "unlock": "Luster Glint: hidden shimmering platforms become solid and visible",
      "spriteNote": "Simplified to one camel; the real bowl has four."
    },
    {
      "id": "tiraz-veil",
      "sprite": "tiraz",
      "title": "Tiraz Veil",
      "date": "dated 373 AH / 983–84 CE",
      "place": "Egypt, state workshop at Tinnis (Nile Delta)",
      "accession": "1971.151",
      "url": "https://www.metmuseum.org/art/collection/search/452271",
      "where": "Not on view (see the Met website)",
      "facts": [
        "A silk veil with two opposed, embroidered bands of kufic inscription.",
        "It names the Fatimid caliph al-ʿAzīz, the workshop at Tinnis, and the year: the game's year, 983–84.",
        "Inscribed cloth like this declared loyalty to the caliph and honored whoever received it."
      ],
      "cardText": "",
      "unlock": "Robe of Honor: Fatimid gatekeepers let you pass (but not in Córdoba!)",
      "spriteNote": "Two opposed brown bands with a small middle band of motifs."
    },
    {
      "id": "blue-quran",
      "sprite": "blueQuran",
      "title": "Folio from the \"Blue Qur'an\"",
      "date": "second half 9th–mid-10th century",
      "place": "Tunisia, possibly Qairawan",
      "accession": "2004.88",
      "url": "https://www.metmuseum.org/art/collection/search/454662",
      "where": "Not on view (see the Met website)",
      "facts": [
        "Gold kufic script and silver verse markers on parchment dyed with indigo.",
        "From one of the most lavish Qur'an manuscripts ever made, with fifteen lines of gold per page.",
        "Probably made in North Africa, where the Fatimids rose to power in 909."
      ],
      "cardText": "",
      "unlock": "Gold Light: a glow that lights dark halls",
      "spriteNote": "Five gold lines stand in for the page's fifteen; the silver dot is a verse marker."
    },
    {
      "id": "pyxis",
      "sprite": "pyxis",
      "title": "Pyxis (ivory box)",
      "date": "ca. 950–75",
      "place": "Spain, Córdoba",
      "accession": "1970.324.5",
      "url": "https://www.metmuseum.org/art/collection/search/471973",
      "where": "The Met Cloisters, Gallery 14",
      "facts": [
        "A carved ivory box, thought to be among the finest works of a master from ʿAbd al-Raḥmān III's palace.",
        "ʿAbd al-Raḥmān III declared himself caliph in 929. By 983 there were three caliphs.",
        "Córdoba's Umayyads rejected Abbasid authority but borrowed the palace arts of Baghdad and Samarra."
      ],
      "cardText": "",
      "unlock": "Journey complete: open the vitrine",
      "spriteNote": "Domed lid and carved openwork suggested with brown cut-outs."
    }
  ]
};

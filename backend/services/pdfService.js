let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch (e) {
  PDFDocument = null;
  console.warn("[PDF Service] Notice: 'pdfkit' module is not yet installed on this server. Run 'npm install' in the backend directory to enable server-side PDF generation.");
}

/**
 * Remove enclosing double, single, or backtick quotation marks from text
 * @param {string} str
 * @returns {string}
 */
function stripQuotes(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, '')
    .trim();
}

/**
 * Clean and normalize text into ASCII-safe PDF text
 * @param {string} txt
 * @returns {string}
 */
function cleanText(txt) {
  if (!txt) return '';
  return String(txt)
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/[\u2192\u21D2\u2794\u27A1]/g, '->')
    .replace(/[\u2022\u2023\u25E6\u2043]/g, '-')
    .replace(/₹/g, 'Rs. ')
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Crisp vector SVG path library normalized on 100x100 coordinate space
 * Used to render resolution-independent animal emblem logos in PDFKit
 */
const ANIMAL_PATHS = {
  // Eagle / Falcon / Hawk (Spread wings, curved predator beak)
  eagle: `M 50 14 C 47 17 43 19 40 21 C 32 17 20 17 8 25 C 18 29 26 37 29 46 C 22 44 13 46 6 53 C 15 55 23 61 27 69 C 19 71 13 77 10 85 C 22 82 31 74 36 66 C 39 73 44 79 50 84 C 56 79 61 73 64 66 C 69 74 78 82 90 85 C 87 77 81 71 73 69 C 77 61 85 55 94 53 C 87 46 78 44 71 46 C 74 37 82 29 92 25 C 80 17 68 17 60 21 C 57 19 53 17 50 14 Z M 50 28 C 53 28 55 31 55 34 C 55 38 52 41 50 43 C 48 41 45 38 45 34 C 45 31 47 28 50 28 Z`,

  // Rabbit / Hare (Tall upright ears, rounded cheeks and head)
  rabbit: `M 38 12 C 34 12 32 18 33 28 C 34 38 37 46 40 50 C 33 53 28 59 28 67 C 28 77 37 86 50 86 C 63 86 72 77 72 67 C 72 59 67 53 60 50 C 63 46 66 38 67 28 C 68 18 66 12 62 12 C 58 12 55 20 54 30 C 53 36 53 42 54 46 C 53 46 51 46 50 46 C 49 46 47 46 46 46 C 47 42 47 36 46 30 C 45 20 42 12 38 12 Z M 44 63 C 44 61 46 60 48 60 C 50 60 52 61 52 63 C 52 65 50 66 48 66 C 46 66 44 65 44 63 Z M 56 63 C 56 61 58 60 60 60 C 62 60 64 61 64 63 C 64 65 62 66 60 66 C 58 66 56 65 56 63 Z M 50 68 C 52 68 53 70 52 71 C 51 73 49 73 48 71 C 47 70 48 68 50 68 Z`,

  // Octopus / Squid (Bulbous mantle, 8 undulating tentacles)
  octopus: `M 50 15 C 33 15 25 28 25 44 C 25 54 30 61 35 65 C 31 68 22 70 15 76 C 11 80 13 86 18 85 C 25 84 31 77 35 71 C 36 78 34 84 30 88 C 26 92 31 96 35 93 C 41 89 43 80 43 73 C 45 78 47 84 47 90 C 47 96 53 96 53 90 C 53 84 55 78 57 73 C 57 80 59 89 65 93 C 69 96 74 92 70 88 C 66 84 64 78 65 71 C 69 77 75 84 82 85 C 87 86 89 80 85 76 C 78 70 69 68 65 65 C 70 61 75 54 75 44 C 75 28 67 15 50 15 Z M 40 42 C 37 42 35 45 35 48 C 35 51 37 54 40 54 C 43 54 45 51 45 48 C 45 45 43 42 40 42 Z M 60 42 C 57 42 55 45 55 48 C 55 51 57 54 60 54 C 63 54 65 51 65 48 C 65 45 63 42 60 42 Z`,

  // Dolphin (Leaping arch, rostrum beak, dorsal fin, fluke)
  dolphin: `M 82 45 C 78 42 70 40 62 38 C 58 31 54 22 47 18 C 47 24 49 32 52 37 C 40 37 28 41 20 48 C 14 53 10 61 14 65 C 18 69 25 66 31 63 C 33 69 36 73 40 76 C 41 73 41 68 40 64 C 48 64 57 66 65 70 C 72 74 77 80 75 85 C 80 83 85 78 87 72 C 89 66 87 58 84 52 C 86 50 89 48 91 46 C 89 45 85 45 82 45 Z M 72 48 C 70 48 68 46 68 44 C 68 42 70 40 72 40 C 74 40 76 42 76 44 C 76 46 74 48 72 48 Z`,

  // Wolf / Fox / Dog (Pointed upright ears, proud snout, bushy fur)
  wolf: `M 50 18 L 42 32 C 38 31 33 32 28 35 L 24 20 L 22 38 C 16 45 15 54 18 62 C 22 71 30 78 40 82 L 40 86 L 46 86 L 47 82 C 49 82 51 82 53 82 L 54 86 L 60 86 L 60 82 C 70 78 78 71 82 62 C 85 54 84 45 78 38 L 76 20 L 72 35 C 67 32 62 31 58 32 L 50 18 Z M 38 48 C 35 48 33 46 33 43 C 33 40 35 38 38 38 C 41 38 43 40 43 43 C 43 46 41 48 38 48 Z M 62 48 C 59 48 57 46 57 43 C 57 40 59 38 62 38 C 65 38 67 40 67 43 C 67 46 65 48 62 48 Z M 50 62 C 46 62 44 65 46 67 C 48 70 52 70 54 67 C 56 65 54 62 50 62 Z`,

  // Beaver (Rounded head, buck teeth, broad paddle tail)
  beaver: `M 45 18 C 36 18 30 25 30 35 C 24 38 20 45 20 54 C 20 66 28 76 40 80 C 42 84 46 86 52 86 C 58 86 63 83 66 78 C 76 77 84 68 85 56 C 86 46 80 40 74 38 C 73 26 64 18 53 18 C 50 18 47 18 45 18 Z M 38 34 C 36 34 34 32 34 30 C 34 28 36 26 38 26 C 40 26 42 28 42 30 C 42 32 40 34 38 34 Z M 58 34 C 56 34 54 32 54 30 C 54 28 56 26 58 26 C 60 26 62 28 62 30 C 62 32 60 34 58 34 Z M 45 50 L 45 58 L 49 58 L 49 50 Z M 51 50 L 51 58 L 55 58 L 55 50 Z`,

  // Meerkat (Slender sentinel, alert ears, upright posture)
  meerkat: `M 50 12 C 44 12 40 16 40 22 C 40 26 42 29 44 32 C 41 36 40 42 40 50 C 38 56 36 64 36 74 C 36 80 39 86 44 88 C 47 89 53 89 56 88 C 61 86 64 80 64 74 C 64 64 62 56 60 50 C 60 42 59 36 56 32 C 58 29 60 26 60 22 C 60 16 56 12 50 12 Z M 46 22 C 45 22 44 21 44 20 C 44 19 45 18 46 18 C 47 18 48 19 48 20 C 48 21 47 22 46 22 Z M 54 22 C 53 22 52 21 52 20 C 52 19 53 18 54 18 C 55 18 56 19 56 20 C 56 21 55 22 54 22 Z`,

  // Hedgehog / Porcupine (Radiating quill spikes and curious snout)
  hedgehog: `M 50 16 L 46 24 L 38 18 L 38 28 L 28 24 L 32 34 L 22 34 L 28 44 L 18 48 L 26 56 L 18 64 L 28 68 L 24 78 L 36 76 L 38 86 L 48 80 L 52 88 L 60 80 L 66 86 L 68 76 L 78 78 L 74 68 L 84 64 L 76 56 L 84 48 L 74 44 L 80 34 L 70 34 L 74 24 L 64 28 L 64 18 L 56 24 Z M 42 48 C 39 48 37 45 37 42 C 37 39 39 36 42 36 C 45 36 47 39 47 42 C 47 45 45 48 42 48 Z M 58 48 C 55 48 53 45 53 42 C 53 39 55 36 58 36 C 61 36 63 39 63 42 C 63 45 61 48 58 48 Z M 50 58 C 47 58 45 61 47 63 C 49 66 51 66 53 63 C 55 61 53 58 50 58 Z`,

  // Chameleon / Lizard (Prehensile curling tail, big eye, crest)
  chameleon: `M 65 24 C 54 22 44 26 38 34 C 32 42 30 52 34 62 C 36 66 40 70 45 72 C 38 72 32 76 28 82 C 24 88 28 94 34 94 C 40 94 44 88 44 84 C 44 80 40 78 36 78 C 42 76 48 76 54 74 C 64 70 72 62 76 52 C 80 42 76 30 65 24 Z M 56 38 C 52 38 48 42 48 46 C 48 50 52 54 56 54 C 60 54 64 50 64 46 C 64 42 60 38 56 38 Z`,

  // Mule / Donkey / Horse / Stallion (Equine neck arch, alert ears, muzzle)
  mule: `M 34 18 L 40 32 C 44 32 48 34 52 30 L 52 18 L 58 32 C 64 36 70 42 74 50 C 78 58 80 68 80 78 L 74 78 C 72 70 68 62 64 56 C 62 62 58 68 52 72 L 48 86 L 38 86 L 40 74 C 34 72 30 66 28 58 C 26 48 28 36 34 18 Z M 42 46 C 40 46 38 44 38 42 C 38 40 40 38 42 38 C 44 38 46 40 46 42 C 46 44 44 46 42 46 Z`,

  // Hermit Crab / Crab (Protective shell, outstretched claws)
  crab: `M 50 20 C 36 20 26 30 26 44 C 26 56 34 66 46 68 L 44 80 L 50 78 L 56 80 L 54 68 C 66 66 74 56 74 44 C 74 30 64 20 50 20 Z M 22 36 C 16 38 12 44 14 50 C 16 56 22 58 25 54 L 25 44 C 24 40 23 38 22 36 Z M 78 36 C 77 38 76 40 75 44 L 75 54 C 78 58 84 56 86 50 C 88 44 84 38 78 36 Z M 42 36 C 40 36 38 34 38 32 C 38 30 40 28 42 28 C 44 28 46 30 46 32 C 46 34 44 36 42 36 Z M 58 36 C 56 36 54 34 54 32 C 54 30 56 28 58 28 C 60 28 62 30 62 32 C 62 34 60 36 58 36 Z`,

  // Squirrel (High arching bushy tail, perching posture)
  squirrel: `M 52 24 C 48 24 44 28 44 34 C 44 38 46 42 50 44 C 46 48 44 54 44 60 C 40 62 36 68 36 74 C 36 82 42 88 50 88 C 58 88 64 82 64 74 C 64 68 62 62 58 58 C 62 54 66 46 66 38 C 66 26 72 20 80 20 C 86 20 90 26 88 34 C 84 46 80 58 80 70 C 80 80 86 86 92 86 C 88 90 80 92 74 88 C 68 84 66 76 66 68 C 66 60 70 52 74 42 C 76 36 76 32 74 30 C 72 28 68 30 66 36 C 64 42 62 48 58 52 C 56 46 56 40 58 34 C 58 28 56 24 52 24 Z`,

  // Bee / Honeybee (Striped abdomen, delicate wings, antennae)
  bee: `M 50 14 C 47 14 45 16 45 19 C 45 22 47 24 50 24 C 53 24 55 22 55 19 C 55 16 53 14 50 14 Z M 32 26 C 22 26 15 34 18 44 C 21 54 32 56 42 50 C 40 43 40 36 42 30 C 38 27 35 26 32 26 Z M 68 26 C 65 26 62 27 58 30 C 60 36 60 43 58 50 C 68 56 79 54 82 44 C 85 34 78 26 68 26 Z M 50 32 C 44 32 40 38 40 46 C 40 56 43 68 50 82 C 57 68 60 56 60 46 C 60 38 56 32 50 32 Z`,

  // Badger (Head with distinctive facial racing stripes)
  badger: `M 50 18 C 38 18 30 26 28 38 C 24 44 22 52 24 62 C 26 72 34 82 44 86 C 48 88 52 88 56 86 C 66 82 74 72 76 62 C 78 52 76 44 72 38 C 70 26 62 18 50 18 Z M 40 32 L 40 68 L 44 68 L 44 32 Z M 56 32 L 56 68 L 60 68 L 60 32 Z M 50 72 C 47 72 45 74 47 76 C 49 78 51 78 53 76 C 55 74 53 72 50 72 Z`,

  // Orca / Whale (Apex sea mammal with tall dorsal fin, flukes)
  orca: `M 84 56 C 78 52 70 48 62 46 C 56 38 52 24 46 16 C 46 24 48 36 52 44 C 40 46 28 52 20 60 C 14 66 12 74 16 78 C 22 82 32 78 40 74 C 44 80 48 84 54 86 C 64 88 74 84 80 76 C 86 70 88 62 84 56 Z M 70 56 C 67 56 65 54 65 52 C 65 50 67 48 70 48 C 73 48 75 50 75 52 C 75 54 73 56 70 56 Z`,

  // Cheetah / Leopard / Cat (Aerodynamic feline head)
  cheetah: `M 50 18 C 40 18 32 24 28 34 C 22 36 18 42 18 50 C 18 62 26 74 38 80 C 42 82 46 83 50 83 C 54 83 58 82 62 80 C 74 74 82 62 82 50 C 82 42 78 36 72 34 C 68 24 60 18 50 18 Z M 38 38 C 35 38 33 36 33 33 C 33 30 35 28 38 28 C 41 28 43 30 43 33 C 43 36 41 38 38 38 Z M 62 38 C 59 38 57 36 57 33 C 57 30 59 28 62 28 C 65 28 67 30 67 33 C 67 36 65 38 62 38 Z M 50 64 C 46 64 44 67 46 70 C 48 72 52 72 54 70 C 56 67 54 64 50 64 Z`,

  // Peacock (Regal crowned head and spreading tail fans)
  peacock: `M 50 12 C 48 12 46 14 46 16 C 46 17 47 18 48 19 L 45 22 C 38 20 28 22 20 28 C 12 36 10 48 14 58 C 18 68 28 78 40 84 C 44 86 48 87 50 87 C 52 87 56 86 60 84 C 72 78 82 68 86 58 C 90 48 88 36 80 28 C 72 22 62 20 55 22 L 52 19 C 53 18 54 17 54 16 C 54 14 52 12 50 12 Z M 50 26 C 54 26 57 29 57 34 C 57 40 53 45 50 49 C 47 45 43 40 43 34 C 43 29 46 26 50 26 Z`,

  // Owl (Facial disc, prominent wise round eyes, perched tufts)
  owl: `M 50 16 C 44 16 38 18 32 14 C 30 22 30 30 32 36 C 26 44 24 55 26 66 C 28 75 34 82 42 85 L 40 90 L 46 90 L 48 86 C 49 86 51 86 52 86 L 54 90 L 60 90 L 58 85 C 66 82 72 75 74 66 C 76 55 74 44 68 36 C 70 30 70 22 68 14 C 62 18 56 16 50 16 Z M 38 38 C 43 38 46 42 46 47 C 46 52 43 56 38 56 C 33 56 30 52 30 47 C 30 42 33 38 38 38 Z M 62 38 C 67 38 70 42 70 47 C 70 52 67 56 62 56 C 57 56 54 52 54 47 C 54 42 57 38 62 38 Z M 50 52 L 47 62 L 53 62 Z`,

  // Elephant (Noble trunk, wide ears)
  elephant: `M 50 15 C 38 15 28 22 24 32 C 16 33 10 40 10 50 C 10 61 17 69 27 70 C 29 74 33 78 38 80 L 38 88 L 44 88 L 44 66 C 46 64 48 64 50 64 C 52 64 54 64 56 66 L 56 88 L 62 88 L 62 80 C 67 78 71 74 73 70 C 83 69 90 61 90 50 C 90 40 84 33 76 32 C 72 22 62 15 50 15 Z M 38 42 C 36 42 34 40 34 38 C 34 36 36 34 38 34 C 40 34 42 36 42 38 C 42 40 40 42 38 42 Z M 62 42 C 60 42 58 40 58 38 C 58 36 60 34 62 34 C 64 34 66 36 66 38 C 66 40 64 42 62 42 Z`,

  // Phoenix / Firebird (Rising bird with spreading fire plumes)
  phoenix: `M 50 14 C 46 18 44 24 45 30 C 38 24 28 24 16 32 C 26 36 34 44 36 54 C 28 52 18 54 10 62 C 20 64 28 70 32 80 C 40 76 46 72 50 68 C 54 72 60 76 68 80 C 72 70 80 64 90 62 C 82 54 72 52 64 54 C 66 44 74 36 84 32 C 72 24 62 24 55 30 C 56 24 54 18 50 14 Z`,

  // Lion / Tiger (Majestic mane radiating around noble face)
  lion: `M 50 12 C 42 12 34 16 28 22 C 22 20 16 24 16 32 C 12 38 12 46 16 52 C 12 58 14 66 18 72 C 16 80 24 86 32 86 C 37 88 43 89 50 89 C 57 89 63 88 68 86 C 76 86 84 80 82 72 C 86 66 88 58 84 52 C 88 46 88 38 84 32 C 84 24 78 20 72 22 C 66 16 58 12 50 12 Z M 38 42 C 35 42 33 40 33 37 C 33 34 35 32 38 32 C 41 32 43 34 43 37 C 43 40 41 42 38 42 Z M 62 42 C 59 42 57 40 57 37 C 57 34 59 32 62 32 C 65 32 67 34 67 37 C 67 40 65 42 62 42 Z M 50 56 C 46 56 43 59 45 62 C 47 66 53 66 55 62 C 57 59 54 56 50 56 Z`,

  // Rat / Mouse (Large round ears, slender pointed snout, whiskers)
  rat: `M 34 18 C 26 18 20 25 20 34 C 20 41 24 47 30 50 C 26 56 24 64 26 72 C 28 80 36 86 46 86 C 48 86 50 85 52 85 C 54 85 56 86 58 86 C 68 86 76 80 78 72 C 80 64 78 56 74 50 C 80 47 84 41 84 34 C 84 25 78 18 70 18 C 63 18 58 23 56 29 C 54 28 52 28 50 28 C 48 28 46 28 44 29 C 42 23 37 18 34 18 Z M 40 48 C 38 48 36 46 36 44 C 36 42 38 40 40 40 C 42 40 44 42 44 44 C 44 46 42 48 40 48 Z M 60 48 C 58 48 56 46 56 44 C 56 42 58 40 60 40 C 62 40 64 42 64 44 C 64 46 62 48 60 48 Z M 50 64 C 47 64 45 66 47 68 C 49 70 51 70 53 68 C 55 66 53 64 50 64 Z`,

  // Generic Majestic Animal Crest (Fallback: noble shield with star and laurels)
  crest: `M 50 14 C 36 14 26 22 26 34 C 26 56 38 74 50 86 C 62 74 74 56 74 34 C 74 22 64 14 50 14 Z M 50 28 L 53 37 L 62 37 L 55 43 L 57 52 L 50 46 L 43 52 L 45 43 L 38 37 L 47 37 Z`
};

/**
 * Match any animal name string to the closest vector SVG path
 * @param {string} animalName
 * @returns {string} SVG path string
 */
function getAnimalSvgPath(animalName) {
  const norm = (animalName || '').toLowerCase().trim();
  if (norm.includes('eagle') || norm.includes('falcon') || norm.includes('hawk') || norm.includes('osprey')) return ANIMAL_PATHS.eagle;
  if (norm.includes('rabbit') || norm.includes('hare') || norm.includes('bunny')) return ANIMAL_PATHS.rabbit;
  if (norm.includes('octopus') || norm.includes('squid')) return ANIMAL_PATHS.octopus;
  if (norm.includes('dolphin') || norm.includes('porpoise')) return ANIMAL_PATHS.dolphin;
  if (norm.includes('wolf') || norm.includes('fox') || norm.includes('dog') || norm.includes('hound') || norm.includes('coyote')) return ANIMAL_PATHS.wolf;
  if (norm.includes('beaver')) return ANIMAL_PATHS.beaver;
  if (norm.includes('meerkat')) return ANIMAL_PATHS.meerkat;
  if (norm.includes('hedgehog') || norm.includes('porcupine')) return ANIMAL_PATHS.hedgehog;
  if (norm.includes('chameleon') || norm.includes('lizard') || norm.includes('gecko')) return ANIMAL_PATHS.chameleon;
  if (norm.includes('mule') || norm.includes('donkey') || norm.includes('horse') || norm.includes('stallion') || norm.includes('mustang')) return ANIMAL_PATHS.mule;
  if (norm.includes('crab')) return ANIMAL_PATHS.crab;
  if (norm.includes('squirrel') || norm.includes('chipmunk')) return ANIMAL_PATHS.squirrel;
  if (norm.includes('bee') || norm.includes('wasp') || norm.includes('hornet')) return ANIMAL_PATHS.bee;
  if (norm.includes('badger')) return ANIMAL_PATHS.badger;
  if (norm.includes('orca') || norm.includes('whale')) return ANIMAL_PATHS.orca;
  if (norm.includes('cheetah') || norm.includes('leopard') || norm.includes('panther') || norm.includes('jaguar') || norm.includes('cougar')) return ANIMAL_PATHS.cheetah;
  if (norm.includes('peacock')) return ANIMAL_PATHS.peacock;
  if (norm.includes('owl')) return ANIMAL_PATHS.owl;
  if (norm.includes('elephant')) return ANIMAL_PATHS.elephant;
  if (norm.includes('phoenix') || norm.includes('firebird')) return ANIMAL_PATHS.phoenix;
  if (norm.includes('lion') || norm.includes('tiger') || norm.includes('bear')) return ANIMAL_PATHS.lion;
  if (norm.includes('rat') || norm.includes('mouse') || norm.includes('rodent')) return ANIMAL_PATHS.rat;
  return ANIMAL_PATHS.crest;
}

/**
 * Generate a clean, executive 3-page PDF dossier buffer from avatar data
 * @param {Object} data - Avatar output data { lifeboat, yacht, bridge, title }
 * @returns {Promise<Buffer|null>} - Resolves with PDF file Buffer or null if pdfkit is unavailable
 */
function generateAvatarPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    try {
      if (!data) {
        return reject(new Error('No avatar data provided for PDF generation'));
      }

      if (!PDFDocument) {
        return resolve(null);
      }

      // Margins 0 and overriding continueOnNewPage guarantees strictly 3 pages
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        bufferPages: true,
        autoFirstPage: true,
        info: {
          Title: data.title || 'Customer Avatar Dossier',
          Author: 'WOW Events Customer Avatar Creator',
          Subject: 'Lifeboat & Yacht Customer Avatars with Strategic Bridge',
          Creator: 'Customer Avatar Creator'
        }
      });

      // Disable internal automatic page breaks so PDFKit never adds unexpected blank pages
      doc.continueOnNewPage = function() { return this; };

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 28;
      const contentWidth = pageWidth - (margin * 2); // 539.28 pt

      // Theme Colors
      const colors = {
        navy: '#13294b',
        ink: '#0f1d2e',
        muted: '#5a6878',
        line: '#d5dde6',
        cardBg: '#ffffff',
        bgSoft: '#f8fafc',
        pillBg: '#f1f5f9',
        life: '#e8590c',
        lifeSoft: '#fde7dc',
        lifeSubtle: '#fff8f4',
        yacht: '#0b7a75',
        yachtSoft: '#d8f0ee',
        yachtSubtle: '#f4fbfb',
        bridgeIndigo: '#29497a',
      };

      // Header Banner
      function drawPageHeader(title, subtitle, pageNum, primaryColor, softBgColor) {
        doc.roundedRect(margin, 24, contentWidth, 36, 5)
          .fillAndStroke(softBgColor, primaryColor);

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .text(title.toUpperCase(), margin + 12, 31, { width: contentWidth - 110, lineBreak: false });

        doc.fillColor(colors.muted)
          .font('Helvetica')
          .fontSize(8.5)
          .text(subtitle, margin + 12, 44, { width: contentWidth - 110, lineBreak: false });

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text(`PAGE ${pageNum} OF 3`, margin + contentWidth - 95, 36, { width: 85, align: 'right', lineBreak: false });
      }

      // Page Footer
      function drawPageFooter(pageNum) {
        const footerY = 818;
        doc.strokeColor(colors.line)
          .lineWidth(0.5)
          .moveTo(margin, footerY - 4)
          .lineTo(margin + contentWidth, footerY - 4)
          .stroke();

        doc.fillColor(colors.muted)
          .font('Helvetica')
          .fontSize(8)
          .text('WOW Events | Customer Avatar Creator Dossier', margin, footerY, { lineBreak: false });

        doc.fillColor(colors.muted)
          .font('Helvetica')
          .fontSize(8)
          .text(`Page ${pageNum} of 3`, margin + contentWidth - 70, footerY, { width: 70, align: 'right', lineBreak: false });
      }

      // -------------------------------------------------------------
      // HELPER: RENDER PERSONA PAGE (PAGE 1: LIFEBOAT, PAGE 2: YACHT)
      // -------------------------------------------------------------
      function renderPersonaPage(avatar, isLifeboat) {
        const pageNum = isLifeboat ? 1 : 2;
        const primaryColor = isLifeboat ? colors.life : colors.yacht;
        const softBg = isLifeboat ? colors.lifeSoft : colors.yachtSoft;
        const subtleBg = isLifeboat ? colors.lifeSubtle : colors.yachtSubtle;
        const defaultAnimal = isLifeboat ? 'RABBIT' : 'FALCON';
        const defaultName = isLifeboat ? 'Rescue Rhea the Restless Rabbit' : 'Visionary Victor the Soaring Falcon';
        const defaultTagline = isLifeboat
          ? 'Ears up, heart racing, ready to bolt at the next bad message.'
          : 'Scanning the entire horizon from 10,000 feet, ready for the next peak.';
        const defaultWhy = isLifeboat
          ? 'A rabbit senses danger everywhere and stays in constant survival mode.'
          : 'Falcons fly high above the tactical noise, spotting strategic opportunities early.';

        drawPageHeader(
          isLifeboat ? 'Lifeboat Customer Avatar' : 'Yacht Customer Avatar',
          isLifeboat ? 'Situation: Urgent, In Crisis, High Pain, Needs Rapid Rescue' : 'Situation: Growing, Doing Well, High Ambition, Seeks Status & Scale',
          pageNum,
          primaryColor,
          softBg
        );

        // 1. Hero Box with Circular Portrait Logo Badge (Y: 68 -> 144, Height: 76)
        let curY = 68;
        doc.roundedRect(margin, curY, contentWidth, 76, 5)
          .fillAndStroke(colors.cardBg, colors.line);

        // Circular Logo Badge (Diameter 52pt, matching web application portrait)
        const centerX = margin + 38;
        const centerY = curY + 38;
        doc.circle(centerX, centerY, 26).fillAndStroke(softBg, primaryColor);
        doc.circle(centerX, centerY, 23).fillAndStroke('#ffffff', softBg);

        // Render Animal Vector Emblem inside Badge
        const animalName = stripQuotes(cleanText(avatar.animal || defaultAnimal));
        const svgPath = getAnimalSvgPath(animalName);
        const iconScale = 30 / 100;
        doc.save()
          .translate(centerX - 15, centerY - 15)
          .scale(iconScale)
          .path(svgPath)
          .fillColor(primaryColor)
          .fill()
          .restore();

        // Typography beside Logo Badge
        const textX = margin + 74;
        const textWidth = contentWidth - 86; // ~453 pt

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(`${isLifeboat ? 'LIFEBOAT' : 'YACHT'} ARCHETYPE: ${animalName.toUpperCase()}`, textX, curY + 11, { width: textWidth, lineBreak: false });

        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(14.5)
          .text(stripQuotes(cleanText(avatar.characterName || defaultName)), textX, curY + 24, { width: textWidth, lineBreak: false });

        doc.fillColor(colors.muted)
          .font('Helvetica-Oblique')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.tagline || defaultTagline)), textX, curY + 44, { width: textWidth, height: 26 });

        // 2. Why Animal Box (Y: 150 -> 198, Height: 48)
        curY = 150;
        doc.roundedRect(margin, curY, contentWidth, 48, 4)
          .fillAndStroke(colors.bgSoft, colors.line);

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(`Why a ${animalName}?`, margin + 10, curY + 7, { lineBreak: false });

        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.whyAnimal || defaultWhy)), margin + 10, curY + 20, { width: contentWidth - 20, height: 24 });

        // 3. Current State vs Desired State (Y: 206 -> 298, Height: 92)
        curY = 206;
        const halfWidth = (contentWidth - 12) / 2;

        // Current State Card
        doc.roundedRect(margin, curY, halfWidth, 92, 5)
          .fillAndStroke(isLifeboat ? '#fffaf8' : '#f8fafc', isLifeboat ? colors.life : colors.line);
        doc.fillColor(isLifeboat ? colors.life : colors.muted)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(isLifeboat ? 'CURRENT STATE (THE PAIN)' : 'CURRENT SUCCESS BASELINE', margin + 10, curY + 9, { lineBreak: false });
        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.currentState || (isLifeboat ? 'Facing immediate delivery crisis with failing vendor.' : 'Baseline events are functional, but lack category impact.'))), margin + 10, curY + 24, { width: halfWidth - 20, height: 62 });

        // Desired State Card
        doc.roundedRect(margin + halfWidth + 12, curY, halfWidth, 92, 5)
          .fillAndStroke(isLifeboat ? '#f6fbfb' : '#f6fbfb', colors.yacht);
        doc.fillColor(colors.yacht)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(isLifeboat ? 'DESIRED STATE (THE RELIEF)' : 'DESIRED ASPIRATIONAL PEAK', margin + halfWidth + 22, curY + 9, { lineBreak: false });
        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.desiredState || (isLifeboat ? 'Smooth project stabilization, fixed-scope budget, and praise from executive team.' : 'A signature flagship benchmark event that earns executive acclaim.'))), margin + halfWidth + 22, curY + 24, { width: halfWidth - 20, height: 62 });

        // 4. Stage of Business / Life (Y: 306 -> 338, Height: 32)
        curY = 306;
        doc.roundedRect(margin, curY, contentWidth, 32, 4)
          .fillAndStroke(colors.bgSoft, colors.line);
        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text('STAGE OF BUSINESS / LIFE: ', margin + 10, curY + 10, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.stage || 'Mid-career executive under delivery pressure.')), { width: contentWidth - 170, lineBreak: false });

        // 5. Two-Column Structured Grid (Y: 346 -> 628, Height: 282)
        curY = 346;
        const col1X = margin;
        const col2X = margin + halfWidth + 12;

        // --- LEFT COLUMN ---
        // Top 3 Pain Points / Ambition Drivers
        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text(isLifeboat ? 'Top 3 Pain Points' : 'Top 3 Ambition Drivers & Needs', col1X, curY, { lineBreak: false });

        const pains = Array.isArray(avatar.painPoints) ? avatar.painPoints : [];
        let painY = curY + 16;
        pains.slice(0, 3).forEach((p, idx) => {
          doc.roundedRect(col1X, painY, halfWidth, 36, 4)
            .fillAndStroke(colors.bgSoft, colors.line);
          doc.fillColor(primaryColor)
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .text(`${idx + 1}.`, col1X + 8, painY + 7, { lineBreak: false });
          doc.fillColor(colors.ink)
            .font('Helvetica')
            .fontSize(8)
            .text(stripQuotes(cleanText(p)), col1X + 22, painY + 7, { width: halfWidth - 30, height: 24 });
          painY += 40;
        });

        // Buying Behaviour
        const buyHeaderY = curY + 142;
        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text('Buying Behaviour', col1X, buyHeaderY, { lineBreak: false });

        const buying = Array.isArray(avatar.buyingBehaviour) ? avatar.buyingBehaviour : [];
        let buyY = buyHeaderY + 16;
        buying.slice(0, 3).forEach(b => {
          doc.roundedRect(col1X, buyY, halfWidth, 36, 4)
            .fillAndStroke(colors.cardBg, colors.line);
          doc.fillColor(primaryColor)
            .font('Helvetica')
            .fontSize(8.5)
            .text('-', col1X + 8, buyY + 7, { lineBreak: false });
          doc.fillColor(colors.ink)
            .font('Helvetica')
            .fontSize(8)
            .text(stripQuotes(cleanText(b)), col1X + 18, buyY + 7, { width: halfWidth - 26, height: 24 });
          buyY += 40;
        });

        // --- RIGHT COLUMN ---
        // What They Want
        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text('What They Want', col2X, curY, { lineBreak: false });

        const wants = Array.isArray(avatar.wants) ? avatar.wants : [];
        let wantY = curY + 16;
        wants.slice(0, 3).forEach(w => {
          doc.roundedRect(col2X, wantY, halfWidth, 36, 4)
            .fillAndStroke(subtleBg, colors.line);
          doc.fillColor(colors.yacht)
            .font('Helvetica')
            .fontSize(8.5)
            .text('-', col2X + 8, wantY + 7, { lineBreak: false });
          doc.fillColor(colors.ink)
            .font('Helvetica')
            .fontSize(8)
            .text(stripQuotes(cleanText(w)), col2X + 18, wantY + 7, { width: halfWidth - 26, height: 24 });
          wantY += 40;
        });

        // Language They Use
        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text('Language They Use', col2X, buyHeaderY, { lineBreak: false });

        const quotes = Array.isArray(avatar.language) ? avatar.language : [];
        let quoteY = buyHeaderY + 16;
        quotes.slice(0, 3).forEach(q => {
          doc.roundedRect(col2X, quoteY, halfWidth, 36, 4)
            .fillAndStroke(colors.cardBg, colors.line);
          const cleanedQuote = stripQuotes(cleanText(q));
          doc.fillColor(colors.muted)
            .font('Helvetica-Oblique')
            .fontSize(8)
            .text(`"${cleanedQuote}"`, col2X + 8, quoteY + 7, { width: halfWidth - 16, height: 24 });
          quoteY += 40;
        });

        // 6. Recommended Next Steps (Y: 636 -> 804, Height: 168)
        curY = 636;
        doc.roundedRect(margin, curY, contentWidth, 168, 6)
          .fillAndStroke(colors.bgSoft, primaryColor);

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text(isLifeboat ? 'Recommended Next Steps (Lifeboat Action Plan)' : 'Recommended Next Steps (Yacht Growth Plan)', margin + 12, curY + 9, { lineBreak: false });

        const steps = Array.isArray(avatar.nextSteps) ? avatar.nextSteps : [];
        let stepCardY = curY + 26;
        steps.slice(0, 3).forEach((st, idx) => {
          doc.roundedRect(margin + 12, stepCardY, contentWidth - 24, 40, 4)
            .fillAndStroke(colors.cardBg, colors.line);

          // Step Number Badge
          doc.roundedRect(margin + 20, stepCardY + 8, 24, 24, 3)
            .fillAndStroke(primaryColor, primaryColor);
          doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(String(idx + 1), margin + 20, stepCardY + 15, { width: 24, align: 'center', lineBreak: false });

          // Step Action Text
          doc.fillColor(colors.ink)
            .font('Helvetica')
            .fontSize(8.5)
            .text(stripQuotes(cleanText(st)), margin + 54, stepCardY + 8, { width: contentWidth - 76, height: 26 });

          stepCardY += 46;
        });

        drawPageFooter(pageNum);
      }

      // -------------------------------------------------------------
      // PAGE 1: LIFEBOAT AVATAR
      // -------------------------------------------------------------
      renderPersonaPage(data.lifeboat || {}, true);

      // -------------------------------------------------------------
      // PAGE 2: YACHT AVATAR
      // -------------------------------------------------------------
      doc.addPage();
      renderPersonaPage(data.yacht || {}, false);

      // -------------------------------------------------------------
      // PAGE 3: HOW YOU SERVE BOTH (STRATEGIC BRIDGE)
      // -------------------------------------------------------------
      doc.addPage();
      const br = data.bridge || {};
      drawPageHeader(
        'Strategic Offer Architecture',
        'How to Serve Both: Moving Clients from Emergency Rescue to Retainer Mastery',
        3,
        colors.navy,
        '#eef2f6'
      );

      // 1. Strategic Headline Card (Y: 68 -> 134, Height: 66)
      let curY3 = 68;
      doc.roundedRect(margin, curY3, contentWidth, 66, 5)
        .fillAndStroke(colors.cardBg, colors.line);

      doc.fillColor(colors.muted)
        .font('Helvetica')
        .fontSize(8.5)
        .text('STRATEGIC HEADLINE', margin + 12, curY3 + 8, { lineBreak: false });

      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(13.5)
        .text(stripQuotes(cleanText(br.headline || 'From Emergency Fire Drill to Market-Defining Benchmark')), margin + 12, curY3 + 22, { width: contentWidth - 24, height: 38 });

      // 2. Two Offer Cards Side by Side (Y: 142 -> 292, Height: 150)
      curY3 = 142;
      const halfBoxWidth = (contentWidth - 12) / 2;

      // Lifeboat Offer Card
      doc.roundedRect(margin, curY3, halfBoxWidth, 150, 5)
        .fillAndStroke('#fffaf8', colors.life);
      doc.fillColor(colors.life)
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text('LIFEBOAT OFFER (RESCUE)', margin + 12, curY3 + 10, { lineBreak: false });
      doc.fillColor(colors.muted)
        .font('Helvetica-Oblique')
        .fontSize(8.5)
        .text('Fixed-scope emergency sprint', margin + 12, curY3 + 25, { lineBreak: false });
      doc.strokeColor(colors.lifeSoft)
        .lineWidth(0.5)
        .moveTo(margin + 12, curY3 + 38)
        .lineTo(margin + halfBoxWidth - 12, curY3 + 38)
        .stroke();
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8.5)
        .text(stripQuotes(cleanText(br.lifeboatOffer || 'Rapid-response emergency rescue package with fixed pricing, transparent 48-hour sprints, and direct daily leadership reports.')), margin + 12, curY3 + 46, { width: halfBoxWidth - 24, height: 96 });

      // Yacht Offer Card
      doc.roundedRect(margin + halfBoxWidth + 12, curY3, halfBoxWidth, 150, 5)
        .fillAndStroke('#f6fbfb', colors.yacht);
      doc.fillColor(colors.yacht)
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text('YACHT OFFER (TRANSFORMATION)', margin + halfBoxWidth + 24, curY3 + 10, { lineBreak: false });
      doc.fillColor(colors.muted)
        .font('Helvetica-Oblique')
        .fontSize(8.5)
        .text('Strategic annual retainer partner', margin + halfBoxWidth + 24, curY3 + 25, { lineBreak: false });
      doc.strokeColor(colors.yachtSoft)
        .lineWidth(0.5)
        .moveTo(margin + halfBoxWidth + 24, curY3 + 38)
        .lineTo(margin + contentWidth - 12, curY3 + 38)
        .stroke();
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8.5)
        .text(stripQuotes(cleanText(br.yachtOffer || 'Comprehensive annual brand experience architecture, dedicated concept lab, and multi-event strategic category leadership.')), margin + halfBoxWidth + 24, curY3 + 46, { width: halfBoxWidth - 24, height: 96 });

      // 3. Transformation Journey Ladder (Y: 300 -> 636, Height: 336)
      curY3 = 300;
      doc.roundedRect(margin, curY3, contentWidth, 336, 6)
        .fillAndStroke(colors.bgSoft, colors.line);

      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(11.5)
        .text('The Lifeboat to Yacht Journey Ladder', margin + 14, curY3 + 10, { lineBreak: false });

      doc.fillColor(colors.muted)
        .font('Helvetica')
        .fontSize(8.5)
        .text('How rescue clients naturally transition into long-term strategic relationships:', margin + 14, curY3 + 25, { lineBreak: false });

      const journey = Array.isArray(br.journey) ? br.journey : [
        { tag: 'ENTRY', text: 'Client enters with an urgent rescue problem requiring immediate stabilization.' },
        { tag: 'PROOF', text: 'Flawless execution under fire earns complete executive trust and relief.' },
        { tag: 'UPGRADE', text: 'A post-project review reveals strategic opportunities for the year ahead.' },
        { tag: 'RETAINER', text: 'The relationship upgrades to an annual strategic retainer driving category dominance.' }
      ];

      const ladderColors = [colors.life, colors.navy, colors.bridgeIndigo, colors.yacht];
      let stepRowY = curY3 + 44;
      journey.slice(0, 4).forEach((step, idx) => {
        const badgeColor = ladderColors[idx] || colors.navy;

        // Sub-card for this journey stage
        doc.roundedRect(margin + 12, stepRowY, contentWidth - 24, 64, 4)
          .fillAndStroke(colors.cardBg, colors.line);

        const rawTag = typeof step === 'string'
          ? (step.split(/[:\-–]/)[0] || `STEP ${idx + 1}`)
          : (step.tag || `STEP ${idx + 1}`);

        const rawText = typeof step === 'string'
          ? step.replace(/^[^:\-–]+[:\-–]\s*/, '')
          : (step.text || step.desc || '');

        // Badge pill
        doc.roundedRect(margin + 20, stepRowY + 18, 70, 26, 3)
          .fillAndStroke(badgeColor, badgeColor);

        doc.fillColor('#ffffff')
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(rawTag)).toUpperCase(), margin + 20, stepRowY + 26, { width: 70, align: 'center', lineBreak: false });

        // Step explanation narrative
        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(9)
          .text(stripQuotes(cleanText(rawText)), margin + 102, stepRowY + 12, { width: contentWidth - 124, height: 42 });

        stepRowY += 70;
      });

      // 4. Strategic Summary Card (Y: 646 -> 804, Height: 158)
      curY3 = 646;
      doc.roundedRect(margin, curY3, contentWidth, 158, 6)
        .fillAndStroke(colors.cardBg, colors.navy);

      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text('STRATEGIC SUMMARY MESSAGE', margin + 14, curY3 + 12, { lineBreak: false });

      doc.strokeColor(colors.line)
        .lineWidth(0.5)
        .moveTo(margin + 14, curY3 + 26)
        .lineTo(margin + contentWidth - 14, curY3 + 26)
        .stroke();

      const summaryPromise = stripQuotes(cleanText(br.message || 'We step in when you are in trouble to earn your trust; we stay when you are thriving to fuel your ambition.'));
      doc.fillColor(colors.ink)
        .font('Helvetica-Oblique')
        .fontSize(10.5)
        .text(
          `"${summaryPromise}"`,
          margin + 20,
          curY3 + 42,
          { width: contentWidth - 40, height: 100 }
        );

      drawPageFooter(3);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateAvatarPdfBuffer,
  stripQuotes,
  cleanText,
  getAnimalSvgPath,
  ANIMAL_PATHS,
};

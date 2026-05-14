export interface CarBrand {
  name: string
  models: string[]
}

export const CAR_BRANDS: CarBrand[] = [
  {
    name: "Alfa Romeo",
    models: ["147", "156", "159", "166", "4C", "Brera", "Giulia", "Giulietta", "MiTo", "Spider", "Stelvio", "Tonale"],
  },
  {
    name: "Aston Martin",
    models: ["DB11", "DB9", "DBS", "DBX", "Rapide", "Vantage", "Vanquish"],
  },
  {
    name: "Audi",
    models: [
      "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8",
      "e-tron", "e-tron GT", "e-tron S",
      "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8",
      "R8", "RS3", "RS4", "RS5", "RS6", "RS7",
      "S3", "S4", "S5", "S6", "S7", "S8",
      "SQ5", "SQ7", "SQ8", "TT",
    ],
  },
  {
    name: "BMW",
    models: [
      "Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "Série 6", "Série 7", "Série 8",
      "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX3",
      "M2", "M3", "M4", "M5", "M6", "M8",
      "X1", "X2", "X3", "X4", "X5", "X6", "X7",
      "Z4",
    ],
  },
  {
    name: "Bentley",
    models: ["Bentayga", "Continental GT", "Continental GTC", "Flying Spur", "Mulsanne"],
  },
  {
    name: "Bugatti",
    models: ["Chiron", "Divo", "La Voiture Noire", "Veyron"],
  },
  {
    name: "Cadillac",
    models: ["ATS", "CT4", "CT5", "CT6", "Escalade", "SRX", "XT4", "XT5", "XT6"],
  },
  {
    name: "Chevrolet",
    models: [
      "Aveo", "Camaro", "Captiva", "Colorado", "Corvette",
      "Cruze", "Equinox", "Malibu", "Silverado", "Suburban",
      "Tahoe", "Trailblazer", "Trax",
    ],
  },
  {
    name: "Chrysler",
    models: ["300", "300C", "Grand Voyager", "Pacifica", "Sebring", "Voyager"],
  },
  {
    name: "Citroën",
    models: [
      "Berlingo", "C1", "C2", "C3", "C3 Aircross", "C4", "C4 Cactus",
      "C4 Picasso", "C4 SpaceTourer", "C5", "C5 Aircross", "C5 X",
      "C6", "C8", "DS3", "DS4", "DS5", "Jumper", "Jumpy",
      "Nemo", "Saxo", "SpaceTourer", "Xantia", "Xsara", "ZX",
    ],
  },
  {
    name: "Cupra",
    models: ["Ateca", "Born", "Formentor", "Leon"],
  },
  {
    name: "DS",
    models: ["DS 3", "DS 3 Crossback", "DS 4", "DS 5", "DS 7", "DS 9"],
  },
  {
    name: "Dacia",
    models: ["Bigster", "Dokker", "Duster", "Jogger", "Lodgy", "Logan", "Logan MCV", "Sandero", "Sandero Stepway", "Spring"],
  },
  {
    name: "Dodge",
    models: ["Challenger", "Charger", "Dart", "Durango", "Grand Caravan", "Journey", "Ram"],
  },
  {
    name: "Ferrari",
    models: [
      "296 GTB", "296 GTS", "488 GTB", "488 Pista", "488 Spider",
      "812 GTS", "812 Superfast", "California", "California T",
      "F8 Spider", "F8 Tributo", "GTC4Lusso", "LaFerrari",
      "Portofino", "Portofino M", "Roma", "SF90 Spider", "SF90 Stradale",
    ],
  },
  {
    name: "Fiat",
    models: [
      "500", "500 Abarth", "500C", "500L", "500X",
      "Bravo", "Doblo", "Ducato", "Fiorino",
      "Grande Punto", "Multipla", "Panda", "Punto",
      "Qubo", "Tipo", "Uno",
    ],
  },
  {
    name: "Ford",
    models: [
      "B-Max", "C-Max", "EcoSport", "Edge", "Escape",
      "Explorer", "F-150", "Fiesta", "Focus", "Fusion",
      "Galaxy", "Ka", "Ka+", "Kuga", "Maverick",
      "Mondeo", "Mustang", "Mustang Mach-E", "Puma",
      "Ranger", "S-Max", "Tourneo", "Transit",
    ],
  },
  {
    name: "Honda",
    models: [
      "Accord", "Civic", "CR-V", "CR-Z",
      "e", "Fit", "HR-V", "Insight",
      "Jazz", "Legend", "Odyssey", "Passport",
      "Pilot", "Ridgeline", "Type R",
    ],
  },
  {
    name: "Hyundai",
    models: [
      "Creta", "Elantra", "i10", "i20", "i30", "i40",
      "Ioniq", "Ioniq 5", "Ioniq 6", "Kona", "Kona Electric",
      "Nexo", "Santa Fe", "Santa Cruz",
      "Sonata", "Tucson", "Venue",
    ],
  },
  {
    name: "Infiniti",
    models: ["EX", "FX", "G", "M", "Q30", "Q50", "Q60", "Q70", "QX30", "QX50", "QX60", "QX70", "QX80"],
  },
  {
    name: "Jaguar",
    models: ["E-Pace", "E-Type", "F-Pace", "F-Type", "I-Pace", "S-Type", "XE", "XF", "XJ", "XK"],
  },
  {
    name: "Jeep",
    models: ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Patriot", "Renegade", "Wrangler"],
  },
  {
    name: "Kia",
    models: [
      "Carnival", "Ceed", "EV6", "Niro", "Niro EV",
      "Optima", "Picanto", "ProCeed",
      "Rio", "Seltos", "Sorento", "Soul",
      "Sportage", "Stinger", "Telluride", "Xceed",
    ],
  },
  {
    name: "Lamborghini",
    models: ["Aventador", "Gallardo", "Huracán", "Murcielago", "Urus"],
  },
  {
    name: "Land Rover",
    models: [
      "Defender", "Discovery", "Discovery Sport",
      "Freelander", "Range Rover", "Range Rover Evoque",
      "Range Rover Sport", "Range Rover Velar",
    ],
  },
  {
    name: "Lexus",
    models: ["CT", "ES", "GS", "IS", "LC", "LS", "LX", "NX", "RC", "RX", "UX"],
  },
  {
    name: "Lincoln",
    models: ["Aviator", "Corsair", "MKC", "MKX", "MKZ", "Navigator"],
  },
  {
    name: "Maserati",
    models: ["Ghibli", "GranCabrio", "GranTurismo", "Grecale", "Levante", "MC20", "Quattroporte"],
  },
  {
    name: "Mazda",
    models: ["2", "3", "6", "BT-50", "CX-3", "CX-30", "CX-5", "CX-60", "CX-7", "CX-8", "MX-5", "MX-30", "RX-8"],
  },
  {
    name: "Mercedes-Benz",
    models: [
      "Classe A", "Classe B", "Classe C", "Classe E", "Classe G", "Classe S",
      "CLA", "CLA Shooting Brake", "CLE", "CLS",
      "EQA", "EQB", "EQC", "EQE", "EQS",
      "GLA", "GLB", "GLC", "GLE", "GLS",
      "AMG GT", "AMG GT 4-Door",
      "SL", "SLC", "Sprinter", "Vito", "V-Class",
    ],
  },
  {
    name: "Mini",
    models: ["Cabriolet", "Clubman", "Countryman", "Mini 3 portes", "Mini 5 portes", "Paceman"],
  },
  {
    name: "Mitsubishi",
    models: ["ASX", "Carisma", "Colt", "Eclipse Cross", "Galant", "L200", "Lancer", "Outlander", "Pajero", "Space Star"],
  },
  {
    name: "Nissan",
    models: [
      "350Z", "370Z", "Almera", "Ariya",
      "GT-R", "Juke", "Leaf", "Maxima",
      "Micra", "Murano", "Navara", "Note",
      "Pathfinder", "Patrol", "Primera",
      "Qashqai", "Sentra", "Teana", "Tiida", "X-Trail",
    ],
  },
  {
    name: "Opel",
    models: [
      "Adam", "Agila", "Antara", "Astra", "Cascada",
      "Corsa", "Crossland", "Frontera", "Grandland",
      "Insignia", "Meriva", "Mokka", "Mokka-e",
      "Omega", "Vectra", "Vivaro", "Zafira",
    ],
  },
  {
    name: "Peugeot",
    models: [
      "107", "108", "2008", "205", "206", "207", "208", "208 e",
      "3008", "301", "306", "307", "308", "308 SW",
      "4007", "4008", "407", "408", "5008",
      "508", "508 SW", "607", "807",
      "Boxer", "e-2008", "e-208", "Expert", "Partner", "RCZ",
    ],
  },
  {
    name: "Porsche",
    models: ["718 Boxster", "718 Cayman", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
  },
  {
    name: "RAM",
    models: ["1500", "2500", "3500", "ProMaster"],
  },
  {
    name: "Renault",
    models: [
      "Austral", "Captur", "Clio", "Espace",
      "Fluence", "Grand Scenic", "Kadjar", "Kangoo",
      "Koleos", "Laguna", "Logan", "Master",
      "Megane", "Megane E-Tech", "Sandero",
      "Scenic", "Symbol", "Trafic", "Twingo",
      "Zoe",
    ],
  },
  {
    name: "Rolls-Royce",
    models: ["Cullinan", "Dawn", "Ghost", "Phantom", "Silver Shadow", "Spectre", "Wraith"],
  },
  {
    name: "SEAT",
    models: ["Alhambra", "Arona", "Ateca", "Exeo", "Ibiza", "Leon", "Mii", "Tarraco", "Toledo"],
  },
  {
    name: "Skoda",
    models: ["Citigo", "Enyaq", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Scala", "Superb"],
  },
  {
    name: "Smart",
    models: ["EQ fortwo", "EQ forfour", "forfour", "fortwo"],
  },
  {
    name: "Subaru",
    models: ["BRZ", "Forester", "Impreza", "Legacy", "Levorg", "Outback", "WRX", "XV"],
  },
  {
    name: "Suzuki",
    models: ["Alto", "Baleno", "Celerio", "Grand Vitara", "Ignis", "Jimny", "S-Cross", "Swift", "Vitara", "Wagon R"],
  },
  {
    name: "Tesla",
    models: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y", "Roadster"],
  },
  {
    name: "Toyota",
    models: [
      "Auris", "Avensis", "Aygo", "C-HR", "Camry",
      "Corolla", "Corolla Cross", "FJ Cruiser", "Fortuner",
      "GR86", "GR Supra", "GR Yaris", "Highlander",
      "HiLux", "Land Cruiser", "Land Cruiser Prado",
      "Prius", "Prius Alpha", "Prius C", "Prius PHEV",
      "Prius Plus", "Prius Prime", "Prius V",
      "Proace", "Proace Verso", "RAV4", "RAV4 Hybrid",
      "Rush", "Sequoia", "Sienna", "Tacoma",
      "Tundra", "Urban Cruiser", "Venza", "Verso",
      "Yaris", "Yaris Cross",
    ],
  },
  {
    name: "Volkswagen",
    models: [
      "Amarok", "Arteon", "Caddy", "Crafter",
      "Golf", "Golf GTI", "Golf R", "ID.3", "ID.4", "ID.5", "ID.7",
      "Jetta", "Passat", "Passat SW", "Phaeton",
      "Polo", "Scirocco", "Sharan", "T-Cross", "T-Roc",
      "Taigo", "Tiguan", "Tiguan Allspace",
      "Touareg", "Touran", "Transporter", "Up!",
    ],
  },
  {
    name: "Volvo",
    models: ["C30", "C40", "C70", "S40", "S60", "S80", "S90", "V40", "V60", "V70", "V90", "XC40", "XC60", "XC70", "XC90"],
  },
]

export const CAR_COLORS = [
  "Blanc",
  "Noir",
  "Gris",
  "Argent",
  "Bleu",
  "Rouge",
  "Vert",
  "Jaune",
  "Orange",
  "Beige",
  "Bordeaux",
  "Marron",
  "Violet",
  "Or",
  "Bleu marine",
  "Gris anthracite",
  "Gris métallisé",
  "Blanc nacré",
  "Noir métallisé",
  "Bleu nuit",
]

export const CAR_YEARS: string[] = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => String(new Date().getFullYear() - i)
)

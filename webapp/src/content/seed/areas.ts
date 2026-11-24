import type { SeedArea } from "./types";

/**
 * Service areas — the whole Perth metro, grouped into zones.
 * Edit / add suburbs at /admin/content/areas.
 */
const zones: Record<string, string[]> = {
  "Perth CBD & Inner": [
    "Perth CBD",
    "Northbridge",
    "West Perth",
    "East Perth",
    "Subiaco",
    "Leederville",
    "Nedlands",
    "Claremont",
  ],
  "Northern Suburbs": [
    "Joondalup",
    "Wanneroo",
    "Hillarys",
    "Warwick",
    "Kingsley",
    "Mindarie",
    "Currambine",
    "Carramar",
  ],
  "North-Eastern Suburbs": [
    "Morley",
    "Bassendean",
    "Ballajura",
    "Noranda",
    "Dianella",
    "Maylands",
    "Bayswater",
  ],
  "Eastern Suburbs": [
    "Midland",
    "Ellenbrook",
    "Forrestfield",
    "Kalamunda",
    "Mundaring",
    "Belmont",
    "Guildford",
  ],
  "Western Suburbs": [
    "Cottesloe",
    "Fremantle",
    "Mosman Park",
    "Scarborough",
    "Trigg",
    "Osborne Park",
  ],
  "Southern Suburbs": [
    "Fremantle",
    "Melville",
    "Kardinya",
    "Willagee",
    "Booragoon",
    "Applecross",
    "South Perth",
    "Como",
  ],
  "South-Eastern Suburbs": [
    "Cannington",
    "Canning Vale",
    "Bentley",
    "Victoria Park",
    "Thornlie",
    "Gosnells",
    "Maddington",
  ],
  "South-Western Suburbs": [
    "Success",
    "Cockburn Central",
    "Kwinana",
    "Rockingham",
    "Safety Bay",
    "Baldivis",
    "Secret Harbour",
  ],
  "Peel & Outer": [
    "Mandurah",
    "Pinjarra",
    "Serpentine",
    "Byford",
    "Armadale",
    "Kelmscott",
  ],
};

let order = 0;

export const seedAreas: SeedArea[] = Object.entries(zones).flatMap(([zone, suburbs]) =>
  suburbs.map((suburb) => ({ zone, suburb, sortOrder: ++order })),
);

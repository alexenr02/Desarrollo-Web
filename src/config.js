// Option catalog. Color numbers follow the public configurator's material
// models. Names and the words printed on the dial are ours.

export const CATALOG = {
  "shapes": [
    {
      "id": "octagon",
      "name": "Octagon",
      "family": "octagon",
      "kind": "polygon",
      "sides": 8,
      "radius": 24,
      "opening": 16.2,
      "bezelOuter": 23.6,
      "bezelInner": 16.45,
      "lugReach": 22.6,
      "crownShift": 0,
      "integrated": true,
      "bezelFollowsCase": true,
      "bezels": [
        {
          "id": "case",
          "name": "Case",
          "material": "aluminium",
          "colour": "#c8cacd"
        }
      ]
    },
    {
      "id": "diver",
      "name": "Diver",
      "family": "diver",
      "kind": "circle",
      "radius": 21.6,
      "opening": 16.15,
      "bezelOuter": 22.5,
      "bezelInner": 16.35,
      "lugReach": 20.8,
      "crownShift": 1.6,
      "bezels": [
        {
          "id": "dive-black",
          "name": "Black",
          "material": "aluminium",
          "colour": "#14161a"
        }
      ]
    },
    {
      "id": "chrono",
      "name": "Chrono",
      "family": "chrono",
      "kind": "circle",
      "radius": 19.4,
      "opening": 15.8,
      "bezelOuter": 20.1,
      "bezelInner": 15.95,
      "lugReach": 18.9,
      "crownShift": 0.2,
      "bezels": [
        {
          "id": "alu-black",
          "name": "Black",
          "material": "aluminium",
          "colour": "#17171a"
        },
        {
          "id": "alu-gray",
          "name": "Gray",
          "material": "aluminium",
          "colour": "#6d7076"
        },
        {
          "id": "alu-green",
          "name": "Dark green",
          "material": "aluminium",
          "colour": "#1d3a2b"
        },
        {
          "id": "alu-blue",
          "name": "Dark blue",
          "material": "aluminium",
          "colour": "#1b2a4c"
        },
        {
          "id": "cer-black",
          "name": "Black",
          "material": "ceramic",
          "colour": "#0c0c0e"
        },
        {
          "id": "cer-gray",
          "name": "Gray",
          "material": "ceramic",
          "colour": "#4b4e54"
        },
        {
          "id": "cer-green",
          "name": "Dark green",
          "material": "ceramic",
          "colour": "#12301f"
        },
        {
          "id": "cer-blue",
          "name": "Dark blue",
          "material": "ceramic",
          "colour": "#101d3c"
        }
      ]
    }
  ],
  "finishes": [
    {
      "id": "brushed",
      "name": "Brushed"
    },
    {
      "id": "polished",
      "name": "Polished"
    }
  ],
  "metals": [
    {
      "id": "silver",
      "name": "Steel",
      "swatch": "#c9ccd1",
      "look": {
        "metal": "#c8cacd",
        "polished": "#d2d4d7",
        "satin": 0.34,
        "gloss": 0.06
      }
    },
    {
      "id": "black",
      "name": "Black",
      "swatch": "#1d1e21",
      "look": {
        "metal": "#3a3c40",
        "polished": "#45474c",
        "satin": 0.36,
        "gloss": 0.1
      }
    },
    {
      "id": "gold",
      "name": "Gold",
      "swatch": "#ecd08a",
      "look": {
        "metal": "#f3d791",
        "polished": "#f8e1a6",
        "satin": 0.34,
        "gloss": 0.06
      }
    },
    {
      "id": "rosegold",
      "name": "Rose gold",
      "swatch": "#dca38c",
      "look": {
        "metal": "#eab39c",
        "polished": "#f0bea8",
        "satin": 0.34,
        "gloss": 0.06
      }
    }
  ],
  "bezels": [
    {
      "id": "alu-black",
      "name": "Black",
      "material": "aluminium",
      "colour": "#17171a"
    },
    {
      "id": "alu-gray",
      "name": "Gray",
      "material": "aluminium",
      "colour": "#6d7076"
    },
    {
      "id": "alu-green",
      "name": "Dark green",
      "material": "aluminium",
      "colour": "#1d3a2b"
    },
    {
      "id": "alu-blue",
      "name": "Dark blue",
      "material": "aluminium",
      "colour": "#1b2a4c"
    },
    {
      "id": "cer-black",
      "name": "Black",
      "material": "ceramic",
      "colour": "#0c0c0e"
    },
    {
      "id": "cer-gray",
      "name": "Gray",
      "material": "ceramic",
      "colour": "#4b4e54"
    },
    {
      "id": "cer-green",
      "name": "Dark green",
      "material": "ceramic",
      "colour": "#12301f"
    },
    {
      "id": "cer-blue",
      "name": "Dark blue",
      "material": "ceramic",
      "colour": "#101d3c"
    }
  ],
  "dials": [
    {
      "id": "black",
      "name": "Black",
      "family": "octagon",
      "swatch": "#393b41",
      "look": {
        "top": "#393b41",
        "bottom": "#15130e",
        "frame": "#1b1c1f",
        "lume": "#e9e9e5",
        "print": "#e8eaed",
        "frameRough": 0.24,
        "frameCoat": 0.9,
        "title": "BLACK",
        "pattern": "grid",
        "line": "AUTOMATIC",
        "foot": "STUDIO",
        "second": "#e8eaed"
      }
    },
    {
      "id": "blue",
      "name": "Blue",
      "family": "octagon",
      "swatch": "#44609f",
      "look": {
        "top": "#44609f",
        "bottom": "#272d55",
        "frame": "#8fc3e2",
        "lume": "#b6d6ea",
        "print": "#eef3f8",
        "title": "BLUE",
        "pattern": "grid",
        "line": "AUTOMATIC",
        "foot": "STUDIO",
        "second": "#eef3f8",
        "sub": {
          "colour": "#85b7c8",
          "print": "#1c3170",
          "hand": "#1c3170"
        }
      }
    },
    {
      "id": "green",
      "name": "Green",
      "family": "octagon",
      "swatch": "#2b8553",
      "look": {
        "top": "#2b8553",
        "bottom": "#1c6c42",
        "frame": "#cfe3cc",
        "lume": "#b8dcb4",
        "print": "#e6efe6",
        "title": "GREEN",
        "pattern": "grid",
        "line": "AUTOMATIC",
        "foot": "STUDIO",
        "second": "#e6efe6"
      }
    },
    {
      "id": "pink",
      "name": "Pink",
      "family": "octagon",
      "swatch": "#ebc0c6",
      "look": {
        "top": "#ebc0c6",
        "bottom": "#e4b6bd",
        "frame": "#c21a55",
        "lume": "#efe6e7",
        "print": "#b60b4c",
        "title": "PINK",
        "pattern": "grid",
        "line": "AUTOMATIC",
        "foot": "STUDIO",
        "second": "#b60b4c"
      }
    },
    {
      "id": "teal",
      "name": "Light green",
      "family": "octagon",
      "swatch": "#e2e8cc",
      "look": {
        "top": "#e2e8cc",
        "bottom": "#c7d1b1",
        "frame": "#93b9da",
        "lume": "#d4e5f1",
        "print": "#93b9da",
        "title": "LIGHT GREEN",
        "pattern": "grid",
        "line": "AUTOMATIC",
        "foot": "STUDIO",
        "second": "#93b9da"
      }
    },
    {
      "id": "aqua",
      "name": "Aqua",
      "family": "octagon",
      "swatch": "#beeeea",
      "look": {
        "top": "#beeeea",
        "bottom": "#4ebebf",
        "frame": "#5d6165",
        "lume": "#beb783",
        "print": "#5d6165",
        "title": "AQUA",
        "pattern": "grid",
        "line": "AUTOMATIC",
        "foot": "STUDIO",
        "second": "#5d6165",
        "sub": {
          "colour": "#cd9ead",
          "print": "#26282b",
          "hand": "#1a1b1d"
        }
      }
    },
    {
      "id": "white",
      "name": "White",
      "family": "octagon",
      "swatch": "#f4f4f2",
      "look": {
        "top": "#f4f4f2",
        "bottom": "#dcdcd9",
        "frame": "#9fe2e1",
        "lume": "#f4f5f2",
        "print": "#d83b9f",
        "title": "WHITE",
        "pattern": "grid",
        "line": "AUTOMATIC",
        "foot": "STUDIO",
        "second": "#d83b9f"
      }
    },
    {
      "id": "orange",
      "name": "Navy",
      "family": "octagon",
      "swatch": "#263b7c",
      "look": {
        "top": "#263b7c",
        "bottom": "#172859",
        "frame": "#ef5a26",
        "lume": "#3e4b85",
        "print": "#ef5f2c",
        "title": "NAVY",
        "pattern": "grid",
        "line": "AUTOMATIC",
        "foot": "STUDIO",
        "second": "#ef5f2c"
      }
    },
    {
      "id": "diver-navy",
      "name": "Navy",
      "family": "diver",
      "swatch": "#1a3a6b",
      "look": {
        "top": "#1a3a6b",
        "bottom": "#0c1c38",
        "frame": "#e8e6e0",
        "lume": "#d5e0c8",
        "print": "#e8e6e0",
        "second": "#e8e6e0",
        "title": "NAVY",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "diver-yellow",
      "name": "Yellow",
      "family": "diver",
      "swatch": "#e6c84a",
      "look": {
        "top": "#e6c84a",
        "bottom": "#b89018",
        "frame": "#1c1c1c",
        "lume": "#f6e7a4",
        "print": "#1c1c1c",
        "second": "#1c1c1c",
        "title": "YELLOW",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "diver-green",
      "name": "Green",
      "family": "diver",
      "swatch": "#1f6b45",
      "look": {
        "top": "#1f6b45",
        "bottom": "#0e3a26",
        "frame": "#e7f0e6",
        "lume": "#c5e0c4",
        "print": "#e7f0e6",
        "second": "#e7f0e6",
        "title": "GREEN",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "diver-sand",
      "name": "Sand",
      "family": "diver",
      "swatch": "#e6d7c3",
      "look": {
        "top": "#e6d7c3",
        "bottom": "#cbb89a",
        "frame": "#3a342c",
        "lume": "#f4ead8",
        "print": "#3a342c",
        "second": "#3a342c",
        "title": "SAND",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "diver-white",
      "name": "White",
      "family": "diver",
      "swatch": "#f4f3ef",
      "look": {
        "top": "#f4f3ef",
        "bottom": "#d8d6d0",
        "frame": "#1a1a1a",
        "lume": "#eceae4",
        "print": "#1a1a1a",
        "second": "#1a1a1a",
        "title": "WHITE",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "diver-black",
      "name": "Black",
      "family": "diver",
      "swatch": "#2a2c30",
      "look": {
        "top": "#2a2c30",
        "bottom": "#101114",
        "frame": "#d7d8da",
        "lume": "#d5e3c4",
        "print": "#e8eaed",
        "second": "#e8eaed",
        "title": "BLACK",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "diver-turquoise",
      "name": "Turquoise",
      "family": "diver",
      "swatch": "#3ec8c0",
      "look": {
        "top": "#3ec8c0",
        "bottom": "#147a84",
        "frame": "#102428",
        "lume": "#d5f4f0",
        "print": "#e9fffb",
        "second": "#e9fffb",
        "title": "TURQUOISE",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "diver-pink",
      "name": "Pink",
      "family": "diver",
      "swatch": "#e7a0b4",
      "look": {
        "top": "#e7a0b4",
        "bottom": "#c45a7c",
        "frame": "#3a2030",
        "lume": "#f8e0e8",
        "print": "#3a2030",
        "second": "#3a2030",
        "title": "PINK",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "diver-olive",
      "name": "Olive",
      "family": "diver",
      "swatch": "#6a6a32",
      "look": {
        "top": "#6a6a32",
        "bottom": "#3a3a18",
        "frame": "#e7e6c8",
        "lume": "#ddd8a0",
        "print": "#e7e6c8",
        "second": "#e7e6c8",
        "title": "OLIVE",
        "line": "200 M",
        "foot": "DIVER"
      }
    },
    {
      "id": "ch-yellow",
      "name": "Yellow",
      "family": "chrono",
      "swatch": "#ddbf43",
      "look": {
        "top": "#ddbf43",
        "bottom": "#9f8930",
        "frame": "#ecebe8",
        "lume": "#f4f3f0",
        "print": "#e3502a",
        "second": "#e3502a",
        "title": "YELLOW",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#f3ede6",
          "print": "#e3502a",
          "hand": "#e3502a"
        }
      }
    },
    {
      "id": "ch-slate",
      "name": "Slate",
      "family": "chrono",
      "swatch": "#3e3e3e",
      "look": {
        "top": "#3e3e3e",
        "bottom": "#2c2c2c",
        "frame": "#c4c7cb",
        "lume": "#c8ceaf",
        "print": "#dcdbda",
        "second": "#ecebe8",
        "title": "SLATE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#272726",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-blush",
      "name": "Blush",
      "family": "chrono",
      "swatch": "#fef2e9",
      "look": {
        "top": "#fef2e9",
        "bottom": "#b6aea7",
        "frame": "#e9a9b6",
        "lume": "#faf7f8",
        "print": "#e9a9b6",
        "second": "#e9a9b6",
        "title": "BLUSH",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#fdf1e9",
          "print": "#e9a9b6",
          "hand": "#e9a9b6"
        }
      }
    },
    {
      "id": "ch-navy",
      "name": "Navy",
      "family": "chrono",
      "swatch": "#132532",
      "look": {
        "top": "#132532",
        "bottom": "#0d1a24",
        "frame": "#ecebe8",
        "lume": "#dbe1e5",
        "print": "#dbe1e4",
        "second": "#8b3a22",
        "title": "NAVY",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#cbd2d7",
          "print": "#8b3a22",
          "hand": "#8b3a22"
        }
      }
    },
    {
      "id": "ch-black",
      "name": "Black",
      "family": "chrono",
      "swatch": "#191a1e",
      "look": {
        "top": "#191a1e",
        "bottom": "#121215",
        "frame": "#e8e8e8",
        "lume": "#cad0b1",
        "print": "#dcdddd",
        "second": "#ecebe8",
        "title": "BLACK",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#202124",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-cream",
      "name": "Cream",
      "family": "chrono",
      "swatch": "#ebe9e4",
      "look": {
        "top": "#ebe9e4",
        "bottom": "#a9a7a4",
        "frame": "#151517",
        "lume": "#eceed5",
        "print": "#151517",
        "second": "#e0282f",
        "title": "CREAM",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#dd898a",
          "print": "#d42a2f",
          "hand": "#d42a2f"
        }
      }
    },
    {
      "id": "ch-beige",
      "name": "Beige",
      "family": "chrono",
      "swatch": "#c7b7a8",
      "look": {
        "top": "#c7b7a8",
        "bottom": "#8f8378",
        "frame": "#b8ae9e",
        "lume": "#ebeae9",
        "print": "#5a3d2b",
        "second": "#e0582a",
        "title": "BEIGE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#cfc2b5",
          "print": "#e0582a",
          "hand": "#e0582a"
        }
      }
    },
    {
      "id": "ch-brown",
      "name": "Brown",
      "family": "chrono",
      "swatch": "#bbae95",
      "look": {
        "top": "#bbae95",
        "bottom": "#867d6b",
        "frame": "#ecebe8",
        "lume": "#efefee",
        "print": "#fbfaf9",
        "second": "#6b7a3a",
        "title": "BROWN",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#5f5241",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-ice",
      "name": "Ice",
      "family": "chrono",
      "swatch": "#abd6e1",
      "look": {
        "top": "#abd6e1",
        "bottom": "#7b9aa2",
        "frame": "#ecebe8",
        "lume": "#ebf1f4",
        "print": "#2f6fb5",
        "second": "#ecebe8",
        "title": "ICE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#bae0e9",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-blue",
      "name": "Blue",
      "family": "chrono",
      "swatch": "#02214f",
      "look": {
        "top": "#02214f",
        "bottom": "#011738",
        "frame": "#ecebe8",
        "lume": "#f1f4f7",
        "print": "#e7f1f7",
        "second": "#ecebe8",
        "title": "BLUE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#062957",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-maroon",
      "name": "Maroon",
      "family": "chrono",
      "swatch": "#e0d9c7",
      "look": {
        "top": "#e0d9c7",
        "bottom": "#a19c8f",
        "frame": "#151517",
        "lume": "#312f25",
        "print": "#e5e5e5",
        "second": "#151517",
        "title": "MAROON",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#872d42",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-black-gold",
      "name": "Black gold",
      "family": "chrono",
      "swatch": "#191a1e",
      "look": {
        "top": "#191a1e",
        "bottom": "#121215",
        "frame": "#e8e8e8",
        "lume": "#cad0b1",
        "print": "#dcdddd",
        "second": "#e8b48a",
        "title": "BLACK GOLD",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#202124",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-blue-gold",
      "name": "Blue gold",
      "family": "chrono",
      "swatch": "#02214f",
      "look": {
        "top": "#02214f",
        "bottom": "#011738",
        "frame": "#ecebe8",
        "lume": "#f1f4f7",
        "print": "#e7f1f7",
        "second": "#e8b48a",
        "title": "BLUE GOLD",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#062957",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-white",
      "name": "White",
      "family": "chrono",
      "swatch": "#eeeeee",
      "look": {
        "top": "#eeeeee",
        "bottom": "#ababab",
        "frame": "#151517",
        "lume": "#ecebe8",
        "print": "#151517",
        "second": "#151517",
        "title": "WHITE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#efefef",
          "print": "#151517",
          "hand": "#151517"
        }
      }
    },
    {
      "id": "ch-ink",
      "name": "Ink",
      "family": "chrono",
      "swatch": "#1b1b1b",
      "look": {
        "top": "#1b1b1b",
        "bottom": "#131313",
        "frame": "#ecebe8",
        "lume": "#ecebe8",
        "print": "#d7d7d7",
        "second": "#ecebe8",
        "title": "INK",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#2a2a2a",
          "print": "#ecebe8",
          "hand": "#ecebe8"
        }
      }
    },
    {
      "id": "ch-pale-blue",
      "name": "Pale blue",
      "family": "chrono",
      "swatch": "#dbd7d2",
      "look": {
        "top": "#dbd7d2",
        "bottom": "#9d9a97",
        "frame": "#2f6fb5",
        "lume": "#83b9e5",
        "print": "#c5c7c7",
        "second": "#2f6fb5",
        "title": "PALE BLUE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#042e55",
          "print": "#2f6fb5",
          "hand": "#2f6fb5"
        }
      }
    },
    {
      "id": "ch-mauve",
      "name": "Mauve",
      "family": "chrono",
      "swatch": "#d3cfd2",
      "look": {
        "top": "#d3cfd2",
        "bottom": "#979597",
        "frame": "#151517",
        "lume": "#e6c1c9",
        "print": "#cac6c9",
        "second": "#151517",
        "title": "MAUVE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#dcd8db",
          "print": "#e9a9b6",
          "hand": "#e9a9b6"
        }
      }
    },
    {
      "id": "ch-night-teal",
      "name": "Night teal",
      "family": "chrono",
      "swatch": "#000105",
      "look": {
        "top": "#000105",
        "bottom": "#000003",
        "frame": "#ecebe8",
        "lume": "#d5dbde",
        "print": "#01bcac",
        "second": "#00c3a8",
        "title": "NIGHT TEAL",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#051932",
          "print": "#00c3a8",
          "hand": "#00c3a8"
        }
      }
    },
    {
      "id": "ch-ember",
      "name": "Ember",
      "family": "chrono",
      "swatch": "#1b1b1b",
      "look": {
        "top": "#1b1b1b",
        "bottom": "#131313",
        "frame": "#d8c6a4",
        "lume": "#e0d5b8",
        "print": "#ecebe8",
        "second": "#e2452f",
        "title": "EMBER",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#1a1a1a",
          "print": "#e3502a",
          "hand": "#e3502a"
        }
      }
    },
    {
      "id": "ch-sand",
      "name": "Sand",
      "family": "chrono",
      "swatch": "#786a5e",
      "look": {
        "top": "#786a5e",
        "bottom": "#564c43",
        "frame": "#d8c6a4",
        "lume": "#d6c2a5",
        "print": "#d4d1cd",
        "second": "#d8c6a4",
        "title": "SAND",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#7c6e63",
          "print": "#d8c6a4",
          "hand": "#d8c6a4"
        }
      }
    },
    {
      "id": "ch-graphite",
      "name": "Graphite",
      "family": "chrono",
      "swatch": "#898d92",
      "look": {
        "top": "#898d92",
        "bottom": "#626569",
        "frame": "#151517",
        "lume": "#b4b6b8",
        "print": "#bfc0c2",
        "second": "#151517",
        "title": "GRAPHITE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#787b7f",
          "print": "#151517",
          "hand": "#151517"
        }
      }
    },
    {
      "id": "ch-pale",
      "name": "Pale",
      "family": "chrono",
      "swatch": "#eaecef",
      "look": {
        "top": "#eaecef",
        "bottom": "#a8a9ac",
        "frame": "#1d2b55",
        "lume": "#ecebe8",
        "print": "#d9dbdc",
        "second": "#1d2b55",
        "title": "PALE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#f5f8f9",
          "print": "#1d2b55",
          "hand": "#1d2b55"
        }
      }
    },
    {
      "id": "ch-cloud",
      "name": "Cloud",
      "family": "chrono",
      "swatch": "#e8eced",
      "look": {
        "top": "#e8eced",
        "bottom": "#a7a9aa",
        "frame": "#1d2b55",
        "lume": "#ecebe8",
        "print": "#d9dbdc",
        "second": "#1d2b55",
        "title": "CLOUD",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#f5f7f9",
          "print": "#1d2b55",
          "hand": "#1d2b55"
        }
      }
    },
    {
      "id": "ch-mist",
      "name": "Mist",
      "family": "chrono",
      "swatch": "#ebeeef",
      "look": {
        "top": "#ebeeef",
        "bottom": "#a9abac",
        "frame": "#1d2b55",
        "lume": "#ecebe8",
        "print": "#d9dbdc",
        "second": "#1d2b55",
        "title": "MIST",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#f5f7f9",
          "print": "#1d2b55",
          "hand": "#1d2b55"
        }
      }
    },
    {
      "id": "ch-fog",
      "name": "Fog",
      "family": "chrono",
      "swatch": "#e9eced",
      "look": {
        "top": "#e9eced",
        "bottom": "#a7a9aa",
        "frame": "#1d2b55",
        "lume": "#ecebe8",
        "print": "#d9dbdc",
        "second": "#1d2b55",
        "title": "FOG",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#f5f8f9",
          "print": "#1d2b55",
          "hand": "#1d2b55"
        }
      }
    },
    {
      "id": "ch-chalk",
      "name": "Chalk",
      "family": "chrono",
      "swatch": "#e9e9e9",
      "look": {
        "top": "#e9e9e9",
        "bottom": "#a7a7a7",
        "frame": "#1d2b55",
        "lume": "#ecebe8",
        "print": "#1d2b55",
        "second": "#1d2b55",
        "title": "CHALK",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#f3f3f3",
          "print": "#1d2b55",
          "hand": "#1d2b55"
        }
      }
    },
    {
      "id": "ch-silver",
      "name": "Silver",
      "family": "chrono",
      "swatch": "#e3e3e3",
      "look": {
        "top": "#e3e3e3",
        "bottom": "#a3a3a3",
        "frame": "#151517",
        "lume": "#ecebe8",
        "print": "#c1c3c5",
        "second": "#151517",
        "title": "SILVER",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#f0f0f0",
          "print": "#151517",
          "hand": "#151517"
        }
      }
    },
    {
      "id": "ch-gold-face",
      "name": "Gold face",
      "family": "chrono",
      "swatch": "#d1ad86",
      "look": {
        "top": "#d1ad86",
        "bottom": "#967c60",
        "frame": "#e2c27a",
        "lume": "#151517",
        "print": "#edd08f",
        "second": "#151517",
        "title": "GOLD FACE",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#e5c6a1",
          "print": "#151517",
          "hand": "#151517"
        }
      }
    },
    {
      "id": "ch-sun",
      "name": "Sun",
      "family": "chrono",
      "swatch": "#d5bd4f",
      "look": {
        "top": "#d5bd4f",
        "bottom": "#998838",
        "frame": "#ecebe8",
        "lume": "#ecebe8",
        "print": "#e3502a",
        "second": "#e8502c",
        "title": "SUN",
        "line": "CHRONO",
        "foot": "STUDIO",
        "sub": {
          "colour": "#f1ece5",
          "print": "#e8502c",
          "hand": "#e8502c"
        }
      }
    }
  ],
  "straps": [
    {
      "id": "bracelet",
      "name": "Bracelet",
      "swatch": "linear-gradient(135deg,#e4e6e9,#a9adb3)"
    },
    {
      "id": "rubber-black",
      "name": "Black rubber",
      "swatch": "#1b1c1e",
      "rubber": "#26282c"
    },
    {
      "id": "rubber-blue",
      "name": "Blue rubber",
      "swatch": "#1f3f78",
      "rubber": "#1f3a72"
    },
    {
      "id": "rubber-green",
      "name": "Green rubber",
      "swatch": "#2c6a46",
      "rubber": "#285f41"
    },
    {
      "id": "rubber-white",
      "name": "White rubber",
      "swatch": "#f2f2f0",
      "rubber": "#e9e9e6"
    }
  ]
};

export const DEFAULT_STATE = {
  shape: 'octagon',
  finish: 'brushed',
  metal: 'black',
  bezel: 'case',
  dial: 'black',
  strap: 'rubber-black',
  night: false,
  view: 'front',
};

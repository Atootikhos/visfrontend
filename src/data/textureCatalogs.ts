
export interface Texture {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface TextureCatalog {
  name: string;
  textures: Texture[];
}

export const textureCatalogs: Record<string, TextureCatalog> = {
  concrete: {
    name: "Concrete",
    textures: [
      {
        id: "concrete-gray",
        name: "Classic Gray",
        description: "Traditional concrete finish",
        url: "/gunmetal.png"
      },
      {
        id: "concrete-charcoal",
        name: "Charcoal",
        description: "Dark concrete with modern appeal",
        url: "/gunmetal.png"
      },
      {
        id: "concrete-beige",
        name: "Warm Beige",
        description: "Light concrete with warm tones",
        url: "/gunmetal.png"
      },
      {
        id: "concrete-white",
        name: "Pure White",
        description: "Clean white concrete finish",
        url: "/gunmetal.png"
      }
    ]
  },
  epoxy: {
    name: "Epoxy",
    textures: [
      {
        id: "epoxy-metallic",
        name: "Metallic Silver",
        description: "Reflective metallic finish",
        url: "/gunmetal.png"
      },
      {
        id: "epoxy-flake",
        name: "Color Flake",
        description: "Decorative flake system",
        url: "/gunmetal.png"
      },
      {
        id: "epoxy-solid",
        name: "Solid Color",
        description: "Uniform color coating",
        url: "/gunmetal.png"
      },
      {
        id: "epoxy-quartz",
        name: "Quartz Blend",
        description: "Natural quartz aggregate",
        url: "/gunmetal.png"
      }
    ]
  },
  timber: {
    name: "Timber",
    textures: [
      {
        id: "timber-oak",
        name: "Oak",
        description: "Classic oak wood texture",
        url: "/gunmetal.png"
      },
      {
        id: "timber-cedar",
        name: "Cedar",
        description: "Natural cedar finish",
        url: "/gunmetal.png"
      },
      {
        id: "timber-pine",
        name: "Pine",
        description: "Light pine wood texture",
        url: "/gunmetal.png"
      },
      {
        id: "timber-mahogany",
        name: "Mahogany",
        description: "Rich mahogany finish",
        url: "/gunmetal.png"
      }
    ]
  }
};

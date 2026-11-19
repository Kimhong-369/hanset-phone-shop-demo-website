
  const PRODUCTS = [
    {
      id: 1,
      name: "iPhone 15",
      brand: "Apple",
      price: 799,
      old: 829,
      specs: '128 GB · 6.1" OLED · 48 MP camera',
      about: "A well-rounded everyday iPhone with a bright OLED screen and a 48 MP main camera.",
      highlights: [
        "48 MP main camera",
        "Bright 6.1-inch OLED screen",
        "USB-C charging"
      ],
      img: "assets/iphone15-black.png",
      colors: [
        ["Black", "#2b2d31","assets/iphones/iphone15-black.png"],
        ["Blue", "#a9c4dd", "assets/iphones/iphone15-blue.png"],
        ["Pink", "#e8c5c9", "assets/iphones/iphone15-pink.png"]
      ],
      tag: "Popular"
    },
    {
      id: 2,
      name: "iPhone 15 Pro",
      brand: "Apple",
      price: 999,
      specs: '256 GB · 6.1" OLED · Titanium',
      about: "A premium iPhone with a titanium frame and a capable camera system.",
      highlights: [
        "Titanium frame",
        "256 GB storage",
        "Pro camera system"
      ],
      img: "images/iphone-15-pro.jpg",
      colors: [
        ["Natural", "#a9a396", "assets/iphones/iphone15pro-natural.png"],
        ["Blue", "#3f4a5a", "assets/iphones/iphone15pro-blue.png"]
      ]
    },
    {
      id: 3,
      name: "Galaxy S24",
      brand: "Samsung",
      price: 749,
      old: 799,
      specs: '256 GB · 6.2" AMOLED · 50 MP camera',
      about: "A compact flagship with a vivid AMOLED screen and a sharp camera.",
      highlights: [
        "50 MP main camera",
        "Bright AMOLED screen",
        "256 GB storage"
      ],
      img: "images/galaxy-s24.jpg",
      colors: [
        ["Violet", "#b9a5d8", "assets/samsung/s24-violet.png"],
        ["Onyx", "#26272b", "assets/samsung/s24-onyx.png"],
        ["Amber", "#e0a64a", "assets/samsung/s24-amber.png"]
      ],
      tag: "Sale"
    },
    {
      id: 4,
      name: "Galaxy A55",
      brand: "Samsung",
      price: 399,
      specs: "128 GB · 6.6-inch AMOLED · 5000 mAh",
      about: "A mid-range Galaxy with a large AMOLED screen and a long-lasting battery.",
      highlights: [
        "5000 mAh battery",
        "Large AMOLED screen",
        "Good value for the price"
      ],
      img: "images/galaxy-a55.jpg",
      colors: [
        ["Navy", "#27324f", "assets/samsung/a55-navy.png"],
        ["Lilac", "#c7b8e0", "assets/samsung/a55-lilac.png"]
      ]
    },
    {
      id: 5,
      name: "Pixel 8",
      brand: "Google",
      price: 599,
      old: 699,
      specs: "128 GB · 6.2-inch OLED · 7 years of updates",
      about: "A Google phone with clean software and helpful camera features.",
      highlights: [
        "7 years of software updates",
        "6.2-inch OLED screen",
        "Clean Google software"
      ],
      img: "images/pixel-8.jpg",
      colors: [
        ["Hazel", "#8fa38c", "assets/google/pixel8-hazel.png"],
        ["Rose", "#e7b6b0", "assets/google/pixel8-rose.png"],
        ["Obsidian", "#2c2d30", "assets/google/pixel8-obsidian.png"]
      ],
      tag: "Sale"
    },
    {
      id: 6,
      name: "Pixel 8a",
      brand: "Google",
      price: 499,
      specs: "128 GB · 6.1-inch OLED · Great low-light photos",
      about: "An affordable Pixel with excellent photography and clean software.",
      highlights: [
        "Great low-light photos",
        "6.1-inch OLED screen",
        "Clean Google software"
      ],
      img: "images/pixel-8a.jpg",
      colors: [
        ["Bay", "#7fb4c9", "assets/google/pixel8a-bay.png"],
        ["Aloe", "#b5d1a5", "assets/google/pixel8a-aloe.png"]
      ]
    },
    {
      id: 7,
      name: "Xiaomi 14",
      brand: "Xiaomi",
      price: 699,
      specs: '256 GB · 6.36" AMOLED · Leica lenses',
      about: "A powerful compact phone with a camera system co-engineered with Leica.",
      highlights: [
        "Leica camera lenses",
        "256 GB storage",
        "Compact flagship design"
      ],
      img: "images/xiaomi-14.jpg",
      colors: [
        ["Jade", "#7da894", "assets/xiaomi/xiaomi14-jade.png"],
        ["White", "#ecebe7", "assets/xiaomi/xiaomi14-white.png"],
        ["Black", "#242528", "assets/xiaomi/xiaomi14-black.png"]
      ]
    },
    {
      id: 8,
      name: "Redmi Note 13",
      brand: "Xiaomi",
      price: 229,
      specs: '128 GB · 6.67" AMOLED · 108 MP camera',
      about: "An affordable phone with a large AMOLED screen and a high-resolution camera.",
      highlights: [
        "108 MP camera",
        "Large AMOLED screen",
        "Budget-friendly price"
      ],
      img: "images/redmi-note-13.jpg",
      colors: [
        ["Ocean", "#4a86a8", "assets/xiaomi/redmi-ocean.png"],
        ["Midnight", "#262a33", "assets/xiaomi/redmi-midnight.png"]
      ],
      tag: "Best value"
    }
  ];

  // Returns the color-specific photo first, then the default photo.
  function phoneImg(product, colorIndex = 0) {
    const color = product.colors?.[colorIndex];

    return (color && color[2]) || product.img || "";
  }

  // Generates a real phone image or falls back to the CSS phone illustration.
  function phoneArt(product, colorIndex = 0, size = "") {
    const color = product.colors?.[colorIndex] || ["Black", "#2b2d31"];
    const src = phoneImg(product, colorIndex);

    const drawn = `<div class="phone ${size}" style="--c:${color[1]}"></div>`;

    if (!src) {
      return drawn;
    }

    const img = document.createElement("img");
    img.className = `pimg ${size}`.trim();
    img.src = src;
    img.alt = `${product.name}, ${color[0]}`;
    img.loading = "lazy";

    // If the image fails to load, use the drawn phone instead.
    img.onerror = function () {
      this.onerror = null;
      this.outerHTML = drawn;
    };

    return img.outerHTML;
  }

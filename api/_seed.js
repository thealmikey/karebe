const seed = {
  business: {
    name: "Karebe Wines & Spirits",
    phone: "+254700123456",
    whatsappPhone: "254700123456"
  },
  admin: {
    username: "karebe",
    password: "karebe1234"
  },
  categories: ["Wine", "Whiskey", "Vodka", "Gin", "Champagne", "Local Spirits", "Keg"],
  products: [
    {
      id: "p1",
      name: "Nederburg Cabernet",
      category: "Wine",
      description: "Dry red wine with bold berry notes.",
      image:
        "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=700&q=70",
      popular: true,
      newArrival: false,
      variants: [{ id: "v1", volume: "750ml", price: 2400, stock: 22 }]
    },
    {
      id: "p2",
      name: "Jameson Irish Whiskey",
      category: "Whiskey",
      description: "Smooth triple-distilled classic.",
      image:
        "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=700&q=70",
      popular: true,
      newArrival: true,
      variants: [
        { id: "v2", volume: "750ml", price: 3600, stock: 16 },
        { id: "v3", volume: "1L", price: 4700, stock: 9 }
      ]
    },
    {
      id: "p3",
      name: "Smirnoff Red",
      category: "Vodka",
      description: "Neutral spirit for easy mixing.",
      image:
        "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=800",
      popular: false,
      newArrival: false,
      variants: [{ id: "v4", volume: "750ml", price: 1800, stock: 30 }]
    },
    {
      id: "p4",
      name: "Keg Beer",
      category: "Keg",
      description: "Freshly tapped keg, perfect for chill sessions.",
      image:
        "https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg?auto=compress&cs=tinysrgb&w=800",
      popular: true,
      newArrival: true,
      variants: [{ id: "v5", volume: "Per Glass", price: 80, stock: 500 }]
    }
  ],
  riders: [
    {
      id: "r1",
      name: "John Mwangi",
      phone: "+254711000111",
      pin: "1111",
      active: true
    },
    {
      id: "r2",
      name: "Faith Achieng",
      phone: "+254722000222",
      pin: "2222",
      active: true
    }
  ],
  orders: [],
  deliveries: []
};

module.exports = { seed };

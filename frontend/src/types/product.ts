export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
    category: "popcorn" | "drinks" | "snacks";
}

export const products: Product[] = [
    // Popcorn
    {
        id: 1,
        name: "Caramel Popcorn",
        price: 5,
        image: "/assets/images/products/caramel-popcorn.jpg",
        description: "Sweet caramel-coated popcorn",
        category: "popcorn"
    },
    {
        id: 2,
        name: "Cheese Popcorn",
        price: 5,
        image: "/assets/images/products/cheese-popcorn.jpg",
        description: "Savory cheese-flavored popcorn",
        category: "popcorn"
    },
    {
        id: 3,
        name: "Classic Butter Popcorn",
        price: 4,
        image: "/assets/images/products/butter-popcorn.jpg",
        description: "Traditional buttery popcorn",
        category: "popcorn"
    },
    // Drinks
    {
        id: 4,
        name: "Coca Cola",
        price: 2,
        image: "/assets/images/products/coca-cola.jpg",
        description: "Classic refreshing cola",
        category: "drinks"
    },
    {
        id: 5,
        name: "Sprite",
        price: 2,
        image: "/assets/images/products/sprite.jpg",
        description: "Crisp lemon-lime soda",
        category: "drinks"
    },
    {
        id: 6,
        name: "Fanta",
        price: 2,
        image: "/assets/images/products/fanta.jpg",
        description: "Orange-flavored soft drink",
        category: "drinks"
    },
    // Snacks
    {
        id: 7,
        name: "Nachos",
        price: 4,
        image: "/assets/images/products/nachos.jpg",
        description: "Crispy tortilla chips with cheese sauce",
        category: "snacks"
    },
    {
        id: 8,
        name: "Hot Dog",
        price: 4,
        image: "/assets/images/products/hotdog.jpg",
        description: "Classic movie theater hot dog",
        category: "snacks"
    },
    {
        id: 9,
        name: "Chicken Nuggets",
        price: 5,
        image: "/assets/images/products/nuggets.jpg",
        description: "Crispy chicken nuggets with sauce",
        category: "snacks"
    }
]; 
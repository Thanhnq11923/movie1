export interface CardData {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    email: string;
}

export interface BookingInfo {
    movie: {
        title: string;
        // Add other movie properties as needed
    };
    date: string;
    time: string;
    theater: {
        name: string;
        // Add other theater properties as needed
    };
    format: string;
}

export interface ConcessionItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
} 
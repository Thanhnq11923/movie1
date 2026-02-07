export interface Payment {
    status: string
    method: string
    amount: string
    transactionId: string
    date: string
    refundDate?: string
}

export interface Promotion {
    id: string
    name: string
    type: string
    value: number
    description: string
    savings?: string
    validUntil?: string
    code?: string
}

export interface Ticket {
    id: string
    movieName: string
    movieDetails: {
        director: string
        duration: string
        genre: string
        rating: string
    }
    showTime: {
        date: string
        day: string
        time: string
        room: string
        screen: string
    }
    seat: {
        number: string
        type: string
        location: string
    }
    status: string
    payment: Payment
    customer: {
        name: string
        email: string
        phone: string
    }
    bookingDate: string
    qrCode: string
    cancellationReason?: string
    promotions: {
        applied: Promotion[]
        available: Promotion[]
    }
} 
import { useState } from "react"

interface CreditCardFormProps {
    onSubmit: (data: {
        cardNumber: string
        expiryDate: string
        cvv: string
        cardholderName: string
        email: string
    }) => void
}

export function CreditCardForm({ onSubmit }: CreditCardFormProps) {
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
        email: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-orange-900">Credit Card Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-orange-900">Card Number</label>
                    <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#FF9800] bg-white/50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-orange-900">Expiry Date</label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#FF9800] bg-white/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-orange-900">CVV</label>
                        <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#FF9800] bg-white/50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-orange-900">Cardholder Name</label>
                    <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#FF9800] bg-white/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-orange-900">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@email.com"
                        className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#FF9800] bg-white/50"
                    />
                </div>

                <p className="text-sm text-orange-700">
                    Your payment information is secure and encrypted
                </p>
            </form>
        </div>
    )
} 
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";

export function PaymentHeader() {
    const navigate = useNavigate();

    return (
        <header className=" top-0 left-0 right-0 bg-white z-10">
            <div className="container mx-auto">
                <div className="flex items-center justify-center p-4">
                    <div className="absolute left-50">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                    </div>
                    <h1 className="text-xl font-semibold text-orange-900">Purchase Ticket</h1>
                </div>
            </div>
        </header>
    );
} 
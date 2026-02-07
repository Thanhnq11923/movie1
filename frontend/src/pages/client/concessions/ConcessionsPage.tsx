import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../../layouts/Layout";
import { Button } from "../../../components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store/store";
import { updateConcession, clearConcessions } from "../../../store/bookingSlice";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { OrderSummary } from "../../../components/client/selectcornwater/OrderSummary";
import { watercornService } from "../../../services/api";
import type { Product } from "../../../types/product";

const ProductCard = ({ product, quantity, onUpdate }: { product: Product, quantity: number, onUpdate: (delta: number) => void }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow hover:shadow-md transition-shadow">
        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
        <div className="flex-grow">
            <h3 className="font-semibold text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.description}</p>
            <p className="text-lg font-bold text-orange-600 mt-1">${product.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onUpdate(-1)}
                disabled={quantity === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-orange-500 hover:bg-orange-100 hover:text-orange-600 transition-colors disabled:text-gray-300 border-none shadow-none focus:outline-none"
                style={{ border: 'none' }}
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-lg w-8 text-center">{quantity}</span>
            <button
                onClick={() => onUpdate(1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-orange-500 hover:bg-orange-100 hover:text-orange-600 transition-colors border-none shadow-none focus:outline-none"
                style={{ border: 'none' }}
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    </div>
);

export default function ConcessionsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const concessions = useSelector((state: RootState) => state.booking.concessions) || [];
    const movie = useSelector((state: RootState) => state.booking.movie);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debug state on mount and changes
    useEffect(() => {
        console.log('ConcessionsPage state on mount/update:', { movie, concessions, locationState: location.state });
    }, [movie, concessions, location.state]);

    // Reset concessions when starting new flow
    useEffect(() => {
        if (location.state?.resetConcessions === true) {
            console.log('DEBUG | Resetting concessions due to new flow');
            dispatch(clearConcessions());
        }
    }, [location.state, dispatch]);

    useEffect(() => {
        if (!movie) {
            navigate("/movies");
        }
    }, [movie, navigate]);

    useEffect(() => {
        setLoading(true);
        watercornService.getAll()
            .then(setProducts)
            .catch(() => setError("Failed to load products"))
            .finally(() => setLoading(false));
    }, []);

    if (!movie) {
        return null;
    }
    if (loading) return <div className="text-center py-10">Loading products...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    const handleUpdateQuantity = (product: Product, delta: number) => {
        const existingItem = concessions.find(item => item.id === product.id);
        const currentQty = existingItem?.quantity || 0;
        const newQty = Math.max(0, currentQty + delta);
        console.log('[handleUpdateQuantity]', { product, delta, currentQty, newQty });
        dispatch(updateConcession({ ...product, quantity: newQty }));
    };

    const getQuantity = (productId: number) => {
        return concessions.find(item => item.id === productId)?.quantity || 0;
    };

    const quantities = Object.fromEntries(concessions.map(item => [item.id, item.quantity]));

    const categories = Array.from(new Set(products.map(p => p.category)));

    const handleBack = () => {
        console.log('Navigating back to select-seat, state:', location.state);
        if (!location.state?.scheduleId || !location.state?.cinemaRoomId) {
            console.error('Missing required state for navigation');
            navigate("/movies");
            return;
        }
        navigate("/select-seat", { 
            state: { 
                scheduleId: location.state.scheduleId,
                cinemaRoomId: location.state.cinemaRoomId,
                seats: location.state.seats,
                resetSeats: false
            } 
        });
    };

    const handleContinue = () => {
        navigate("/order-payment", { 
            state: {
                scheduleId: location.state?.scheduleId,
                cinemaRoomId: location.state?.cinemaRoomId,
                seats: location.state?.seats,
                concessions: concessions
            }
        });
    };

    return (
        <MainLayout>
            <header className="bg-white shadow-sm py-4 sticky top-0 z-20 mt-20">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="p-2"
                        onClick={handleBack}
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Button>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-gray-800">Choose Your Snacks</h1>
                        <p className="text-sm text-gray-500">Add popcorn, drinks, and more to your order</p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </header>

            <div className="bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-8">
                            {categories.map(category => (
                                <section key={category}>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {products.filter(p => p.category === category).map(p => (
                                            <ProductCard key={p.id} product={p} quantity={getQuantity(p.id)} onUpdate={(delta) => handleUpdateQuantity(p, delta)} />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                        <div className="w-full lg:w-96 flex-shrink-0">
                            <OrderSummary
                                products={products}
                                quantities={quantities}
                                onUpdateQuantity={(productId, delta) => {
                                    const product = products.find(p => p.id === productId);
                                    if (!product) return;
                                    handleUpdateQuantity(product, delta);
                                }}
                            />
                            <Button
                                onClick={handleContinue}
                                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-base transition-transform transform hover:scale-105"
                            >
                                Continue to Payment
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 
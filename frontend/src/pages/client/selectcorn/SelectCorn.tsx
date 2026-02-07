// SelectCorn.tsx - Sửa lỗi không lấy được date
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../../layouts/Layout";
import { Button } from "../../../components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store/store";
import {
  updateConcession,
  clearConcessions,
} from "../../../store/bookingSlice";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { OrderSummary } from "../../../components/client/selectcornwater/OrderSummary";
import { watercornService } from "../../../services/api";
import type { Product } from "../../../types/product";
import { lockSeat, unlockSeat } from '../../../services/api/seatService';

// Simple hash function to convert string to number
const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const ProductCard = ({
  product,
  quantity,
  onUpdate,
}: {
  product: Product;
  quantity: number;
  onUpdate: (delta: number) => void;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow hover:shadow-md transition-shadow">
    {/* Product Image */}
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 flex-shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
          <span className="text-orange-500 font-bold text-xs">🍿</span>
        </div>
      )}
    </div>

    {/* Product Info */}
    <div className="flex-grow min-w-0">
      <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
        {product.name}
      </h3>
      <p className="text-xs text-gray-500 line-clamp-1 mb-1">
        {product.description}
      </p>
      <p className="font-bold text-gray-900 text-sm">
        Giá: {product.price.toLocaleString()} đ
      </p>
    </div>

    {/* Quantity Controls */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => onUpdate(-1)}
        disabled={quantity === 0}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed border-none shadow-none focus:outline-none"
        style={{ border: "none" }}
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="font-bold text-lg w-8 text-center text-gray-900">
        {quantity}
      </span>
      <button
        onClick={() => onUpdate(1)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border-none shadow-none focus:outline-none"
        style={{ border: "none" }}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export default function SelectCorn() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // ✅ Lấy TẤT CẢ thông tin từ Redux state thay vì chỉ movie
  const { movie, date, time, theater, seats } = useSelector((state: RootState) => state.booking);
  const concessions = useSelector((state: RootState) => state.booking.concessions) || [];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockTimer, setLockTimer] = useState<NodeJS.Timeout | null>(null);
  const [locking, setLocking] = useState(false);

  // Debug state on mount and changes
  useEffect(() => {
    console.log("SelectCorn state on mount/update:", {
      movie, date, time, theater, seats, concessions, locationState: location.state,
    });
    // ✅ Debug concessions format
    console.log(
      "Concessions format check:",
      concessions.map((item) => ({ id: item.id, idType: typeof item.id, quantity: item.quantity, price: item.price }))
    );
  }, [movie, date, time, theater, seats, concessions, location.state]);

  // Reset concessions when starting new flow
  useEffect(() => {
    if (location.state?.resetConcessions === true) {
      console.log("DEBUG | Resetting concessions due to new flow");
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
      .then((watercornData) => {
        // Transform WatercornApiResponse[] to Product[]
        const transformedProducts: Product[] = watercornData.map((item) => ({
          id: hashStringToNumber(item._id),
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          category: item.category as "popcorn" | "drinks" | "snacks",
        }));
        console.log("Transformed products:", transformedProducts);
        setProducts(transformedProducts);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, [lockTimer]);

  // Đặt các return sớm SAU khi khai báo hook
  if (!movie) {
    return null;
  }
  if (loading)
    return <div className="text-center py-10">Loading products...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  const handleUpdateQuantity = (product: Product, delta: number) => {
    const existingItem = concessions.find((item) => item.id === product.id);
    const currentQty = existingItem?.quantity || 0;
    const newQty = Math.max(0, currentQty + delta);
    console.log("[handleUpdateQuantity]", {
      productId: product.id,
      productName: product.name,
      delta,
      currentQty,
      newQty,
      existingItem,
      allConcessions: concessions.map((c) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
      })),
    });
    dispatch(updateConcession({ ...product, quantity: newQty }));
  };

  const getQuantity = (productId: number) => {
    const found = concessions.find((item) => item.id === productId);
    console.log(`[getQuantity] productId: ${productId}, found:`, found);
    return found?.quantity || 0;
  };

  const quantities = Object.fromEntries(
    concessions.map((item) => [item.id, item.quantity])
  );
  console.log("[quantities object]", quantities);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const handleProceedToPayment = async () => {
    if (!location.state?.scheduleId || !location.state?.cinemaRoomId || !seats || seats.length === 0) {
      alert('Missing schedule, room, or seats!');
      return;
    }
    setLocking(true);
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?._id ? String(user._id) : user?.id ? String(user.id) : '';
    if (!userId) {
      alert('Bạn cần đăng nhập để tiếp tục!');
      setLocking(false);
      return;
    }
    try {
      // Lock tất cả ghế, lấy expiresAt lớn nhất
      let maxExpiresAt = 0;
      for (const seat of seats) {
        const res = await lockSeat(location.state.scheduleId, location.state.cinemaRoomId, `${seat.row}${seat.col}`, userId);
        if (res && res.expiresAt) {
          const expires = new Date(res.expiresAt).getTime();
          if (expires > maxExpiresAt) maxExpiresAt = expires;
        }
      }
      if (!maxExpiresAt) {
        maxExpiresAt = Date.now() + 2 * 60 * 1000;
      }
      const timer = setTimeout(async () => {
        for (const seat of seats) {
          await unlockSeat(location.state.scheduleId, location.state.cinemaRoomId, `${seat.row}${seat.col}`, userId);
        }
        alert('Hết thời gian giữ ghế! Vui lòng chọn lại.');
        navigate('/select-seat', { state: { scheduleId: location.state.scheduleId, cinemaRoomId: location.state.cinemaRoomId, resetSeats: true } });
      }, maxExpiresAt - Date.now());
      setLockTimer(timer);
      // Chuyển sang trang payment, truyền expiresAt
      navigate('/payment', {
        state: {
          scheduleId: location.state.scheduleId,
          cinemaRoomId: location.state.cinemaRoomId,
          seats: seats,
          concessions: concessions,
          allSeats: location.state?.allSeats,
          expiresAt: maxExpiresAt,
        },
      });
    } catch (err) {
      alert('Không thể lock ghế. Vui lòng thử lại!');
    } finally {
      setLocking(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-100 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm py-4 sticky top-0 z-20 mt-10">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="p-2"
              onClick={() => {
                console.log("Navigating back, state:", location.state);
                if (
                  !location.state?.scheduleId ||
                  !location.state?.cinemaRoomId
                ) {
                  console.error("Missing required state for navigation");
                  navigate("/movies");
                  return;
                }
                navigate("/select-seat", {
                  state: {
                    scheduleId: location.state.scheduleId,
                    cinemaRoomId: location.state.cinemaRoomId,
                    seats: location.state.seats,
                    resetSeats: false,
                  },
                });
              }}
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">
                Choose Your Snacks
              </h1>
              <p className="text-sm text-gray-500">
                Add popcorn, drinks, and more to your order
              </p>
            </div>
            <div className="w-10"></div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 ">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
              {categories.map((category) => (
                <section key={category}>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {products
                      .filter((p) => p.category === category)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          quantity={getQuantity(p.id)}
                          onUpdate={(delta) => handleUpdateQuantity(p, delta)}
                        />
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
                  const product = products.find((p) => p.id === productId);
                  if (!product) return;
                  handleUpdateQuantity(product, delta);
                }}
                // ✅ Sử dụng data từ Redux state thay vì location.state
                movieName={
                  movie?.versionMovieEnglish || movie?.versionMovieVn || ""
                }
                movieImage={movie?.largeImage || ""}
                format={movie?.format?.[0] || ""}
                theater={
                  typeof theater === "string" ? theater : theater?.name || ""
                } // ✅ Từ Redux
                date={date || ""} // ✅ Từ Redux
                time={time || ""} // ✅ Từ Redux
                selectedSeats={seats || []} // ✅ Từ Redux (seats)
                allSeats={location.state?.allSeats || []} // Vẫn từ location.state vì allSeats không lưu trong Redux
              />
              <Button
                onClick={handleProceedToPayment}
                disabled={locking}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-base transition-transform transform hover:scale-105"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

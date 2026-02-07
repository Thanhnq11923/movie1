/* eslint-disable @typescript-eslint/no-explicit-any */
import { MainLayout } from "../../../../layouts/Layout";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { promotionService } from "../../../../services/api";
import type { Promotion } from "../../../../types/promotion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const PromotionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // State management
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherPromotions, setOtherPromotions] = useState<Promotion[]>([]);
  const [loadingOtherPromotions, setLoadingOtherPromotions] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch promotion details
  const fetchPromotion = async () => {
    if (!slug) {
      setError("Invalid promotion slug");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await promotionService.getPromotionBySlug(slug);

      if (response.success) {
        setPromotion(response.data);
      } else {
        setError(response.message || "Không thể tải thông tin promotion");
      }
    } catch (err: any) {
      const errorMessage = promotionService.handleError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch other promotions
  const fetchOtherPromotions = async () => {
    try {
      setLoadingOtherPromotions(true);
      const response = await promotionService.getAllPromotions(
        1,
        10,
        "-createdAt"
      );

      if (response.success) {
        // Filter out the current promotion and get up to 6 other promotions
        const filteredPromotions = response.data
          .filter((p) => p.slug !== slug)
          .slice(0, 6);
        setOtherPromotions(filteredPromotions);
      }
    } catch (err: any) {
      console.error("Error fetching other promotions:", err);
      // If API fails, use mock data as fallback
      setOtherPromotions([
        {
          slug: "mock-1",
          title: "Real Chill - Very Chill Vibes",
          description: "Enjoy relaxing movie experiences",
          image:
            "https://images.unsplash.com/photo-1489599835385-400fe74d0e0f?w=400&h=300&fit=crop",
          content: [],
          shareCount: 150,
          createdAt: new Date(),
          updatedAt: new Date(),
          related: [],
        },
        {
          slug: "mock-2",
          title: "Shopping Season Fun - Galaxy Sweet Popcorn",
          description: "Special popcorn deals for shopping season",
          image:
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=300&fit=crop",
          content: [],
          shareCount: 89,
          createdAt: new Date(),
          updatedAt: new Date(),
          related: [],
        },
        {
          slug: "mock-3",
          title: "Late Night Movies - Cheers Discount",
          description: "Discounts for late night movie sessions",
          image:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop",
          content: [],
          shareCount: 234,
          createdAt: new Date(),
          updatedAt: new Date(),
          related: [],
        },
        {
          slug: "mock-4",
          title: "Hot Snacks - Crispy Treats",
          description: "Fresh hot snacks for movie lovers",
          image:
            "https://images.unsplash.com/photo-1489599835385-400fe74d0e0f?w=400&h=300&fit=crop",
          content: [],
          shareCount: 67,
          createdAt: new Date(),
          updatedAt: new Date(),
          related: [],
        },
        {
          slug: "mock-5",
          title: "Weekend Discount - Popcorn Special",
          description: "Weekend specials on popcorn and drinks",
          image:
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=300&fit=crop",
          content: [],
          shareCount: 189,
          createdAt: new Date(),
          updatedAt: new Date(),
          related: [],
        },
        {
          slug: "mock-6",
          title: "Student Discount - School's Out",
          description: "Special discounts for students",
          image:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop",
          content: [],
          shareCount: 145,
          createdAt: new Date(),
          updatedAt: new Date(),
          related: [],
        },
      ]);
    } finally {
      setLoadingOtherPromotions(false);
    }
  };

  // Load promotion and other promotions on component mount
  useEffect(() => {
    fetchPromotion();
    fetchOtherPromotions();
  }, [slug]);

  // Render content based on type
  const renderContent = (content: any, index: number) => {
    switch (content.type) {
      case "text":
        return (
          <div key={index} className="mb-4">
            <p className="text-gray-700 leading-relaxed">{content.value}</p>
          </div>
        );

      case "program_info":
        return (
          <div key={index} className="">
            {content.duration && (
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-18 font-bold">Duration:</span>
                  <span>
                    {content.duration.from
                      ? new Date(content.duration.from).toLocaleDateString()
                      : ""}
                    {content.duration.from && content.duration.to ? " – " : ""}
                    {content.duration.to
                      ? new Date(content.duration.to).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case "combo":
        return (
          <div key={index} className="">
            <h4 className="font-bold text-lg mb-3">{content.name}:</h4>
            {content.options && (
              <ul className="list-disc pl-5 space-y-2">
                {content.options.map((option: any, optIndex: number) => (
                  <li className="list-none" key={optIndex}>
                    {option.items} ={" "}
                    <span className="font-bold text-red-600">
                      {option.price}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case "note":
        return (
          <div key={index} className="mb-4">
            <p className="text-gray-700 italic">{content.value}</p>
          </div>
        );

      case "conditions":
        return (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-bold text-yellow-600 mb-4">
              Conditions
            </h3>
            {content.list && (
              <ul className="list-disc pl-5 space-y-2">
                {content.list.map((item: string, listIndex: number) => (
                  <li key={listIndex} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <MainLayout>
          <div className="container mx-auto px-4 pt-20 pb-10">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Đang tải thông tin promotion...
                </p>
              </div>
            </div>
          </div>
        </MainLayout>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <MainLayout>
          <div className="container mx-auto px-4 pt-20 pb-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Lỗi khi tải dữ liệu
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={fetchPromotion}
                      className="text-sm text-red-800 hover:text-red-900 underline"
                    >
                      Thử lại
                    </button>
                    <button
                      onClick={() => navigate("/promotion")}
                      className="text-sm text-red-800 hover:text-red-900 underline"
                    >
                      Quay lại danh sách
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MainLayout>
      </div>
    );
  }

  // No promotion found
  if (!promotion) {
    return (
      <div>
        <MainLayout>
          <div className="container mx-auto px-4 pt-20 pb-10">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy promotion
              </h3>
              <p className="text-gray-500 mb-4">
                Promotion bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
              </p>
              <Link
                to="/promotion"
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Quay lại danh sách promotions
              </Link>
            </div>
          </div>
        </MainLayout>
      </div>
    );
  }

  return (
    <div>
      <MainLayout>
        <div className="container mx-auto px-4 pt-20 pb-10">
          {/* Breadcrumb */}
          <div className="flex items-center mb-8 text-sm">
            <Link to="/" className="text-yellow-600 hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/promotion" className="text-yellow-600 hover:underline">
              Promotions
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-600">{promotion.title}</span>
          </div>

          {/* Promotion Header */}
          <div className="border-b border-gray-300 mb-6 pb-2 mt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-600">
              {promotion.title}
            </h1>
                         {promotion.code && (
               <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-sm">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-2xl font-semibold text-yellow-600 mb-1">
                       Promotion Code
                     </h3>
                     <p className="text-sm text-yellow-600">
                       Click to copy the code
                     </p>
                   </div>
                   <div className="text-right">
                     <button
                       onClick={() => {
                         if (promotion.code) {
                           navigator.clipboard.writeText(promotion.code);
                           // Show copy notification
                           const notification = document.createElement('div');
                           notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transform transition-all duration-300';
                           notification.textContent = 'Code copied to clipboard!';
                           document.body.appendChild(notification);
                           
                           // Remove notification after 3 seconds
                           setTimeout(() => {
                             notification.style.transform = 'translateX(100%)';
                             setTimeout(() => {
                               document.body.removeChild(notification);
                             }, 300);
                           }, 2000);
                         }
                       }}
                       className="px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                     >
                       <span className="text-2xl font-bold text-yellow-600 tracking-wider">
                         {promotion.code}
                       </span>
                     </button>
                   </div>
                 </div>
               </div>
             )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Image */}
            <div className="md:col-span-1">
              <img
                src={promotion.image}
                alt={promotion.title}
                className="w-full rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/400x300/FFD700/000000?text=Promotion+Image";
                }}
              />
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2">
              <div className="prose max-w-none">
                <p className="text-lg font-medium mb-4">
                  {promotion.description}
                </p>

                {/* Content Sections */}
                <div className="space-y-6">
                  {promotion.content.map((content, index) =>
                    renderContent(content, index)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Promotions */}
          <div className="mt-16">
            <div className="border-b border-gray-300 mb-8 pb-2">
              <h2 className="text-2xl font-bold text-yellow-600">
                OTHER PROMOTIONS
              </h2>
            </div>

            {loadingOtherPromotions ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                <span className="ml-3 text-gray-600">
                  Đang tải promotions khác...
                </span>
              </div>
            ) : otherPromotions.length > 0 ? (
              <div className="w-full">
                <Swiper
                  modules={[Pagination]}
                  spaceBetween={30}
                  slidesPerView={4}
                  pagination={false}
                  loop={true}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 30,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    },
                    1280: {
                      slidesPerView: 4,
                      spaceBetween: 30,
                    },
                  }}
                >
                  {otherPromotions.map((otherPromotion) => (
                    <SwiperSlide key={otherPromotion.slug}>
                      <div className="flex items-center">
                        <Link
                          to={`/promotion/${otherPromotion.slug}`}
                          className="block w-full"
                        >
                          <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                            <img
                              src={otherPromotion.image}
                              alt={otherPromotion.title}
                              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/400x300/FFD700/000000?text=Promotion";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              <h3 className="font-bold text-sm mb-1 hover:text-yellow-300 transition-colors line-clamp-2">
                                {otherPromotion.title}
                              </h3>
                              <p className="text-xs text-gray-200 line-clamp-1">
                                {otherPromotion.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Không có promotions khác để hiển thị.
                </p>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default PromotionDetail;

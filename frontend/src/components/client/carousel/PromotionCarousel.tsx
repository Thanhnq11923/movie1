/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { promotionService } from "../../../services/api";
import type { Promotion } from "../../../types/promotion";

const PromotionCarousel: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch promotions from API
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await promotionService.getAllPromotions(
        1,
        8,
        "-createdAt"
      );

      if (response.success) {
        setPromotions(response.data);
      } else {
        setError(response.message || "Không thể tải danh sách promotions");
      }
    } catch (err: any) {
      const errorMessage = promotionService.handleError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load promotions on component mount
  useEffect(() => {
    fetchPromotions();
  }, []);

  // Helper function to get promotion badge info
  const getPromotionBadge = (promotion: Promotion) => {
    if (promotion.shareCount > 100) {
      return { text: "Hot", color: "bg-yellow-500" };
    }
    if (
      promotion.createdAt &&
      new Date(promotion.createdAt) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) {
      return { text: "New", color: "bg-green-400" };
    }
    return null;
  };

  // Helper function to get discount info
  const getDiscountInfo = (promotion: Promotion) => {
    const discountContent = promotion.content.find(
      (content) =>
        content.value?.toLowerCase().includes("%") ||
        content.value?.toLowerCase().includes("discount")
    );
    return discountContent?.value || null;
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center mt-8 mb-8">
        <h2 className="text-2xl text-[#034ea2] mb-8 text-left w-[80%] ml-[-80px]">
          PROMOTION NEWS
        </h2>
        <div className="w-[86%] flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải promotions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center mt-8 mb-8">
        <h2 className="text-2xl text-[#034ea2] mb-8 text-left w-[80%] ml-[-80px]">
          PROMOTION NEWS
        </h2>
        <div className="w-[86%] flex justify-center items-center h-64">
          <div className="text-center text-red-600">
            <p>Lỗi khi tải promotions: {error}</p>
            <button
              onClick={fetchPromotions}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start mt-8 mb-8 mx-auto container">
      <h2 className="text-2xl font-bold text-[#034ea2] mb-8">PROMOTION NEWS</h2>
      <div className="w-[100%]">
        {promotions.length > 0 ? (
          <Swiper
            modules={[Pagination]}
            spaceBetween={30}
            slidesPerView={4}
            pagination={{ clickable: true, el: ".custom-swiper-pagination" }}
            loop={true}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 25,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
            }}
          >
            {promotions.map((promotion) => {
              const badge = getPromotionBadge(promotion);
              const discount = getDiscountInfo(promotion);

              return (
                <SwiperSlide key={promotion.slug}>
                  <Link
                    to={`/promotion/${promotion.slug}`}
                    className="group h-auto flex flex-col items-center justify-between w-full"
                  >
                    <div className="relative overflow-hidden w-full h-auto flex-shrink-0">
                      <img
                        src={promotion.image}
                        alt={promotion.title}
                        className="w-full auto object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Try multiple fallback images
                          const fallbackImages = [
                            "https://images.unsplash.com/photo-1489599835385-400fe74d0e0f?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop",
                            "https://via.placeholder.com/400x300/FFD700/000000?text=Promotion",
                          ];

                          const currentSrc = e.currentTarget.src;
                          const currentIndex =
                            fallbackImages.indexOf(currentSrc);

                          if (currentIndex < fallbackImages.length - 1) {
                            e.currentTarget.src =
                              fallbackImages[currentIndex + 1];
                          } else {
                            e.currentTarget.src =
                              fallbackImages[fallbackImages.length - 1];
                          }
                        }}
                      />
                      {badge && (
                        <div
                          className={`absolute top-3 right-3 ${badge.color} text-white text-xs font-bold px-3 py-1`}
                        >
                          {badge.text}
                        </div>
                      )}
                      {discount && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1">
                          {discount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full">
                      <div className="text-md font-semibold text-gray-800 text-center group-hover:text-yellow-600 transition-colors min-h-[48px] flex items-center justify-center">
                        {promotion.title}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-400 text-6xl mb-4">📢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading...
            </h3>
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
        <div className="custom-swiper-pagination flex justify-center mt-6" />
      </div>
    </div>
  );
};

export default PromotionCarousel;

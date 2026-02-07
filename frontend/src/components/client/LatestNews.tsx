import { Heart, ThumbsUp } from "lucide-react";
import React from "react";

const newsData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80", // Main large image
    title: "Premiere of 'Fantastic Four' at Nizami Cinema Center",
    date: "October 15, 2024",
    description:
      "The highly anticipated superhero film 'Fantastic Four,' directed by acclaimed filmmaker Matt Shakman, premiered at Nizami Cinema Center. This epic tale of cosmic adventure has captivated audiences with its stunning visuals and gripping storyline. Screenings are available throughout the month!",
    likes: 679,
    comments: 45,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", // Secondary image
    title: "Review: Detective Conan - The Million-dollar Pentagram",
    date: "July 10, 2025",
    description:
      "A thrilling new chapter in the Detective Conan series, blending mystery and action. Critics praise its engaging plot and stunning animation.",
    likes: 679,
    comments: 23,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", // Secondary image
    title: "Review: Superman - James Gunn's Epic Showcase",
    date: "July 20, 2025",
    description:
      "James Gunn's reimagined Superman offers a fresh perspective with breathtaking action sequences and emotional depth.",
    likes: 444,
    comments: 15,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", // Secondary image
    title: "Review: Jurassic World Rebirth - Dinosaurs Return",
    date: "August 5, 2025",
    description:
      "The latest Jurassic World installment brings back dinosaurs with new thrills and impressive visual effects.",
    likes: 762,
    comments: 30,
  },
];

const LatestNews: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center mt-8 mb-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#034ea2] mb-6 sm:mb-8 text-left w-full max-w-7xl">
        LATEST NEWS
      </h2>
      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-6 lg:gap-8 lg:h-[500px]">
        {/* Left: Main news */}
        <div className="flex-1 lg:flex-[1.2] bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative h-64 sm:h-80 lg:h-[500px]">
            <img
              src={newsData[0].image}
              alt={newsData[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent sm:p-6">
              <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-bold mb-2">
                {newsData[0].title}
              </h3>
              <div className="text-white text-xs sm:text-sm mb-2 text-right opacity-80">
                {newsData[0].date}
              </div>
              <p className="text-white text-sm sm:text-base opacity-90 hidden sm:block line-clamp-3">
                {newsData[0].description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: List news */}
        <div className="flex-1 flex flex-col justify-between lg:h-[500px]">
          <div className="flex flex-col gap-4 sm:gap-2">
            {newsData.slice(1, 4).map((item) => (
              <div
                key={item.id}
                className="flex flex-row gap-3 sm:gap-4 items-start hover:bg-gray-50 rounded-lg transition-colors"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[242px] lg:h-auto object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">
                    {item.date}
                  </div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-800 leading-tight line-clamp-2 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 hidden lg:block">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {item.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {item.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestNews;

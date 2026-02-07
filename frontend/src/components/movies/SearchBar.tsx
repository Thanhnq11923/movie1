import { Search } from "lucide-react";

/**
 * Props cho component SearchBar
 */
interface SearchBarProps {
  searchQuery: string; // Giá trị hiện tại của ô tìm kiếm
  onSearchChange: (query: string) => void; // Hàm xử lý khi người dùng thay đổi từ khóa tìm kiếm
}

/**
 * Component SearchBar - Thanh tìm kiếm phim
 * Cho phép người dùng nhập từ khóa để tìm kiếm phim theo tên
 */
export default function SearchBar({
  searchQuery,
  onSearchChange,
}: SearchBarProps) {
  return (
    <div className="w-full md:w-1/3 mt-12">
      <div className="relative">
        {/* Ô input tìm kiếm */}
        <input
          type="text"
          placeholder="Search Movie..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 pr-12 text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
        />
        {/* Nút tìm kiếm với icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 p-2 rounded-lg transition-colors">
          <Search size={20} />
        </div>
      </div>
    </div>
  );
}

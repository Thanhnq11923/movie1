import { ChevronDown } from "lucide-react";

/**
 * Interface cho các bộ lọc được chọn
 */
export interface SelectedFilters {
  format: string;
  category: string;
  nation: string;
}

/**
 * Props cho component FilterTabs
 */
interface FilterTabsProps {
  selectedFilters: SelectedFilters;
  activeDropdown: string | null;
  uniqueFormats: string[];
  uniqueCategories: string[];
  uniqueNations: string[];
  onToggleDropdown: (dropdown: string) => void;
  onFilterSelect: (
    filterType: "format" | "category" | "nation",
    value: string
  ) => void;
  onClearFilters: () => void;
}

/**
 * Component FilterTabs - Các tab lọc phim
 * Cho phép người dùng lọc phim theo định dạng, thể loại và quốc gia
 */
export default function FilterTabs({
  selectedFilters,
  activeDropdown,
  uniqueFormats,
  uniqueCategories,
  uniqueNations,
  onToggleDropdown,
  onFilterSelect,
  onClearFilters,
}: FilterTabsProps) {
  /**
   * Component con cho từng dropdown filter
   */
  const FilterDropdown = ({
    type,
    label,
    options,
    selectedValue,
  }: {
    type: "format" | "category" | "nation";
    label: string;
    options: string[];
    selectedValue: string;
  }) => (
    <div className="relative">
      {/* Nút mở dropdown */}
      <button
        onClick={() => onToggleDropdown(type)}
        className={`flex items-center gap-2 px-0 py-3 text-lg font-bold transition-colors border-b-2 ${
          selectedValue || activeDropdown === type
            ? "text-[#003B95] border-[#003B95]"
            : "text-gray-500 border-transparent hover:text-[#003B95]"
        }`}
      >
        {selectedValue || label}
        <ChevronDown
          size={16}
          className={`transform transition-transform ${
            activeDropdown === type ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menu dropdown */}
      {activeDropdown === type && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-md shadow-md z-10 min-w-40">
          <ul className="py-2">
            {options.map((option) => (
              <li key={option}>
                <button
                  onClick={() => onFilterSelect(type, option)}
                  className={`w-full text-left px-4 py-2 transition-colors duration-150 ${
                    selectedValue === option
                      ? "bg-blue-50 text-[#003B95] font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-wrap mt-20 items-center gap-6 mb-10 ">
      {/* Nút xóa tất cả bộ lọc */}
      <button
        onClick={onClearFilters}
        className={`flex items-center gap-2 px-2 text-lg font-bold transition-colors border-l-5 ${
          !selectedFilters.format &&
          !selectedFilters.category &&
          !selectedFilters.nation
            ? "text-[#003B95] border-[#003B95]"
            : "text-gray-500 border-transparent hover:text-[#003B95]"
        }`}
      >
        All
      </button>

      {/* Dropdown lọc theo định dạng */}
      <FilterDropdown
        type="format"
        label="Format"
        options={uniqueFormats}
        selectedValue={selectedFilters.format}
      />

      {/* Dropdown lọc theo thể loại */}
      <FilterDropdown
        type="category"
        label="Types"
        options={uniqueCategories}
        selectedValue={selectedFilters.category}
      />

      {/* Dropdown lọc theo quốc gia */}
      <FilterDropdown
        type="nation"
        label="Nation"
        options={uniqueNations}
        selectedValue={selectedFilters.nation}
      />
    </div>
  );
}

// import { Link } from 'react-router-dom';

type NavItem = {
  key: string;
  name: string;
};

const navItems: NavItem[] = [
  { key: "info", name: "Personal Information" },
  { key: "history", name: "Transaction History" },
  { key: "redeem", name: "Redeem Point" },
];

interface ProfileNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const ProfileNav = ({ activeTab, setActiveTab }: ProfileNavProps) => {
  return (
    <nav className="border-b border-gray-200 pb-2 sm:pb-4">
      <ul className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 -mb-px overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <li key={item.name} className="flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`whitespace-nowrap py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-3 border-b-2 font-medium text-xs sm:text-sm md:text-base transition-colors ${
                  isActive
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {item.name}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
} 
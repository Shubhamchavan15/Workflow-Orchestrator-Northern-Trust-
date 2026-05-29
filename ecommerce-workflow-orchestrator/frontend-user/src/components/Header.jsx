import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaBolt, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const location      = useLocation();
  const { dark, toggle } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
            <FaShoppingCart className="text-white text-lg" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">ShopFlow</span>
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">DEMO</span>
          </div>
        </div>

        <nav className="flex gap-2 items-center">
          <Link to="/"
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              location.pathname === "/" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <FaBolt size={11} /> Shop
          </Link>
          <Link to="/track"
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              location.pathname === "/track" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <FaSearch size={11} /> Track Order
          </Link>

          {/* Dark mode toggle */}
          <button onClick={toggle}
            className="ml-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode">
            {dark ? <FaSun className="text-yellow-400 text-lg" /> : <FaMoon className="text-gray-500 text-lg" />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

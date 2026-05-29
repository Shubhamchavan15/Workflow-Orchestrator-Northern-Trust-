import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaBolt, FaMoon, FaSun, FaBoxOpen } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const location         = useLocation();
  const { dark, toggle } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40 group-hover:scale-105 transition-transform">
            <FaShoppingCart className="text-white text-sm" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">ShopFlow</span>
            <span className="ml-2 text-[10px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Demo</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link to="/"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              location.pathname === "/"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <FaBolt size={10} /> Shop
          </Link>

          <Link to="/track"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              location.pathname === "/track"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}>
            <FaBoxOpen size={10} /> Track Order
          </Link>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          <button onClick={toggle}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode">
            {dark
              ? <FaSun  className="text-yellow-400 text-base" />
              : <FaMoon className="text-gray-400 text-base" />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

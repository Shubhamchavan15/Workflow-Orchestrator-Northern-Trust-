import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaBolt } from "react-icons/fa";

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
            <FaShoppingCart className="text-white text-lg" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-800">ShopFlow</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">DEMO</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex gap-2 items-center">
          <Link to="/"
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              location.pathname === "/"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <FaBolt size={11} /> Shop
          </Link>
          <Link to="/track"
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              location.pathname === "/track"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <FaSearch size={11} /> Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

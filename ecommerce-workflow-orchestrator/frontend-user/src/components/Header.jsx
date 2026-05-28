import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaSearch } from "react-icons/fa";

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <FaShoppingCart className="text-white text-lg" />
          </div>
          <span className="text-xl font-bold text-gray-800">ShopFlow</span>
        </div>

        <nav className="flex gap-2">
          <Link
            to="/"
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              location.pathname === "/"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Place Order
          </Link>
          <Link
            to="/track"
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              location.pathname === "/track"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaSearch size={12} />
            Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

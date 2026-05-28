import {
  FaBell,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";

const Navbar = () => {
  return (
    <div className="bg-white h-20 shadow-sm flex items-center justify-between px-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Dashboard
      </h1>

      <div className="flex items-center gap-6 text-2xl text-gray-600">
        <FaSearch className="cursor-pointer hover:text-blue-500" />

        <div className="relative">
          <FaBell className="cursor-pointer hover:text-blue-500" />

          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            3
          </span>
        </div>

        <FaUserCircle className="text-4xl cursor-pointer hover:text-blue-500" />
      </div>
    </div>
  );
};

export default Navbar;
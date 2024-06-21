import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { getUserData, updateData } from "../redux/slices/userSlices";
import logo from "../assets/logo.png";
import { getUserInfoByAPI } from "../api/user";
import { showToast } from "../utils/showToast";
import DataContext from "../context/DataContext";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showSubmenu, setShowSubmenu] = useState(false);
  const { isNeedGetNewToken, setIsNeedGetNewToken } = useContext(DataContext)!;
  const dataUser = useSelector(getUserData);
  const [activeMenu, setActiveMenu] = useState("main");
  const location = useLocation();

  useEffect(() => {
    // Xác định menu active dựa trên đường dẫn hiện tại
    const path = location.pathname;
    if (path === "/") setActiveMenu("main");
    else if (path.startsWith("/zalo")) setActiveMenu("zalo");
    else if (path.startsWith("/facebook")) setActiveMenu("facebook");
  }, [location]);

  const MenuLink: React.FC<{
    to: string;
    menu: string;
    children: React.ReactNode;
  }> = ({ to, menu, children }) => {
    const isActive = activeMenu === menu;
    return (
      <Link
        to={to}
        className={`${
          isActive
            ? "border-indigo-500 text-gray-900"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
        onClick={() => setActiveMenu(menu)}
      >
        {children}
      </Link>
    );
  };

  useEffect(() => {
    if (dataUser) {
      if (dataUser.user === null || dataUser.user === undefined) {
        getProfile();
      }
    }
  }, [dataUser]);

  const getProfile = async () => {
    const result: any = await getUserInfoByAPI({}, dataUser.token.accessToken);
    //console.log("getProfile", result);
    if (result.status === 200) {
      dispatch(
        updateData({
          token: dataUser.token,
          user: result.data.data.user,
        } as any)
      );
    } else {
      setIsNeedGetNewToken(true);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img className="h-8 w-auto" src={logo} alt="Logo" />
          </div>

          {/* Center Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <MenuLink to="/app" menu="main">
              Main
            </MenuLink>
            <MenuLink to="/app/zalo" menu="zalo">
              Zalo
            </MenuLink>
            <MenuLink to="/app/facebook" menu="facebook">
              Facebook
            </MenuLink>
          </div>

          {dataUser ? (
            <div className="ml-6 flex items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={() => setShowSubmenu(!showSubmenu)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="text-gray-700">
                      Xin chào, {dataUser.user?.email || ""}
                    </span>
                  </button>
                </div>
                {showSubmenu && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/app/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Tài khoản
                    </Link>
                    <Link
                      to="/app/subscription"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Gói sử dụng
                    </Link>
                    <Link
                      to="/logout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </nav>
  );
}

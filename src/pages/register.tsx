import { useDispatch, useSelector } from "react-redux";
import { ImageButton, PasswordInput, TextInput } from "../components";
import { getUserData, updateData } from "../redux/slices/userSlices";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../utils/showToast";
import { postRegister } from "../api/user";
import { URL_API } from "../constants/api";
import { useDisableBodyScroll } from "../hooks/use-disable-body-scroll";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dataUser = useSelector(getUserData);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    password: "",
    rePassword: "",
    checkbox: false,
  });

  useDisableBodyScroll(true);

  useEffect(() => {
    if (dataUser) {
      console.log("Redirect to Home");
      navigate("/app");
    }
  }, [dataUser]);

  const createAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password === formData.rePassword) {
      setIsLoading(true);

      const result: any = await postRegister(formData);

      if (result.status == 200) {
        if (result.data.status) {
          console.log("postRegister", result);
          showToast({ type: "success", message: result.data.message });
          //dispatch(updateData(result.data.data));
          navigate("/login");
        } else {
          setIsLoading(false);
          showToast({ type: "error", message: result.data.message });
        }
      } else {
        console.log(result);
        setIsLoading(false);
        showToast({ type: "error", message: result.data.message });
      }
    } else {
      setIsLoading(false);
      showToast({ type: "error", message: "Mật khẩu không trùng khớp" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-gray-800">
          Đăng ký tài khoản
        </h3>
        <form onSubmit={createAccount}>
          <div className="mt-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="name"
              >
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                id="name"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.fullname}
                onChange={(e) =>
                  setFormData({ ...formData, fullname: e.target.value })
                }
                required
              />
            </div>
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="phone"
              >
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                id="phone"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập email"
                id="email"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                id="password"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="confirmPassword"
              >
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                id="confirmPassword"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.rePassword}
                onChange={(e) =>
                  setFormData({ ...formData, rePassword: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                type="submit"
              >
                Đăng ký
              </button>
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { ImageButton, PasswordInput, TextInput } from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserData,
  getUsertErr,
  loginUser,
} from "../redux/slices/userSlices";
import { FormEvent, useEffect, useState } from "react";
import { ValuePropsGetUser } from "../utils/interface.global";
import { URL_API } from "../constants/api";
import { useDisableBodyScroll } from "../hooks/use-disable-body-scroll";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dataUser = useSelector(getUserData);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const loginError = useSelector(getUsertErr);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (dataUser) {
      console.log("Login redirect");
      navigate("/app");
    }
  }, [dataUser]);

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [loginError]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data: ValuePropsGetUser = {
      email: formData.email,
      password: formData.password,
    };
    dispatch(loginUser(data) as any);
  };

  useDisableBodyScroll(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-gray-800">
          Đăng nhập vào tài khoản của bạn
        </h3>
        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
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
                placeholder="Nhập mật khẩu của bạn"
                id="password"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <button
                disabled={isLoading}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                type="submit"
              >
                Đăng nhập
              </button>
              <Link
                to="/register"
                className="text-sm text-blue-600 hover:underline"
              >
                Đăng ký
              </Link>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/quen-mat-khau"
                className="text-sm text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

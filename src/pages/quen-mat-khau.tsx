import { Link, useNavigate } from "react-router-dom";
import { ImageButton, PasswordInput, TextInput } from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserData,
  getUsertErr,
  loginUser,
} from "../redux/slices/userSlices";
import { useEffect, useState } from "react";
import { ValuePropsGetUser } from "../utils/interface.global";
import { URL_API } from "../constants/api";
import { showToast } from "../utils/showToast";
import { postforgotPassword } from "../api/user";

export default function QuenMatKhau() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending reset code to:", email);
    setStep(2);
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Verifying code:", code);
    setStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Resetting password:", newPassword);
    // Xử lý đặt lại mật khẩu và chuyển hướng
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-gray-800">
          Quên mật khẩu
        </h3>
        {step === 1 && (
          <form onSubmit={handleSubmitEmail}>
            <div className="mt-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                type="submit"
              >
                Gửi mã xác nhận
              </button>
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmitCode}>
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="code"
              >
                Mã xác nhận
              </label>
              <input
                type="text"
                placeholder="Nhập mã xác nhận"
                id="code"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                type="submit"
              >
                Xác nhận
              </button>
              <button
                className="px-4 py-2 text-blue-600 bg-transparent border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                type="button"
                onClick={handleBack}
              >
                Quay lại
              </button>
            </div>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="newPassword"
              >
                Mật khẩu mới
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                id="newPassword"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                id="confirmPassword"
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                type="submit"
              >
                Đặt lại mật khẩu
              </button>
              <button
                className="px-4 py-2 text-blue-600 bg-transparent border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                type="button"
                onClick={handleBack}
              >
                Quay lại
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dataUser = useSelector(getUserData);
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
  });
  const loginError = useSelector(getUsertErr);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (dataUser) {
      navigate("/");
    }
  }, [dataUser]);

  const onLogin = () => {
    navigate("/login");
  };

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [loginError]);

  const handleConfirm = async () => {
    if (formData.email != "" && formData.phone != "") {
      setIsLoading(true);

      const result: any = await postforgotPassword(formData);

      if (result.status == 200) {
        if (result.data.status) {
          showToast({ type: "success", message: result.data.message });
          navigate("/page/8s66WjsLb75XnPEW");
        } else {
          setIsLoading(false);
          showToast({ type: "error", message: result.data.message });
        }
      } else {
        setIsLoading(false);
        showToast({ type: "error", message: result.data.message });
      }
    } else {
      setIsLoading(false);
      showToast({
        type: "error",
        message: "vui lòng nhập email và số điện thoại",
      });
    }
  };

  return (
    <div
      className="w-full h-full bg-cover bg-no-repeat relative overflow-hidden min-h-[727px]"
      style={{ backgroundImage: "url(/assets/images/home/home-bg.png)" }}
    >
      <div className="absolute -bottom-3 right-0 left-0 pointer-events-none">
        <img
          src="/assets/images/common/main-item.svg"
          alt="Home"
          className="w-[200%] ml-[-58%] max-w-[200%] mx-auto relative z-20"
        />
      </div>
      <div className="absolute top-[110px] left-5 right-5 h-[360px] bg-no-repeat p-5">
        <img
          src="/assets/images/common/big-frame.png"
          alt="Home"
          className="w-full h-full absolute top-0 left-0 right-0 bottom-0"
        />
        <div className="w-full h-full no-scrollbar flex items-start max-h-[360px]">
          <div className="h-[400px] mx-auto  no-scrollbar">
            <h2 className="text-center uppercase text-white font-bold text-[24px] leading-[28px] relative mt-2">
              gửi yêu cầu
              <br />
              lấy lại mật khẩu
            </h2>
            <div className="flex flex-col gap-4 mt-5">
              <TextInput
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e })}
                placeholder="Số điện thoại"
              />
              <TextInput
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e })}
                placeholder="Email"
              />
            </div>
            <div className="flex justify-center mt-5 relative z-30">
              {isLoading ? (
                <p className="text-white self-center mt-4 font-semibold text-center underline whitespace-nowrap">
                  Đang xử lý
                </p>
              ) : (
                <ImageButton
                  text="Gửi yêu cầu"
                  textClassName="text-white font-bold uppercase text-[14px]"
                  onClick={handleConfirm}
                  altText="Gửi yêu cầu"
                  imageSrc="/assets/images/common/gradient-btn-frame.svg"
                  className="w-[150px] mx-auto"
                />
              )}
            </div>
            <div className="flex justify-center mt-2 z-30 relative">
              <ImageButton
                text="Đăng nhập"
                textClassName="text-white font-bold uppercase text-[14px]"
                onClick={onLogin}
                altText="Đăng nhập"
                imageSrc="/assets/images/common/gradient-btn-frame.svg"
                className="w-[150px] mx-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-1 right-0 left-0 flex justify-center items-center">
        <ImageButton
          text="Xem thêm ưu đãi khác"
          textClassName="text-[11px] text-white uppercase font-bold"
          imageSrc="/assets/images/common/uu-dai-btn.svg"
          className="mx-auto w-44 z-40"
          altText="Play"
          onClick={() => {
            window.open(URL_API.XEM_THEM, "_blank");
          }}
        />
      </div>
    </div>
  );
}

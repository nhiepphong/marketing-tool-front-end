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
import { useDisableBodyScroll } from "../hooks/use-disable-body-scroll";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dataUser = useSelector(getUserData);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    checkbox: true,
  });
  const loginError = useSelector(getUsertErr);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (dataUser) {
      navigate("/");
    }
  }, [dataUser]);

  const onRegister = () => {
    navigate("/register");
  };

  const onClickQuenMatKhau = () => {
    navigate("/quen-mat-khau");
  };

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [loginError]);

  const handleConfirm = () => {
    setIsLoading(true);
    const data: ValuePropsGetUser = {
      phone: formData.phone,
      password: formData.password,
    };
    dispatch(loginUser(data) as any);
  };

  useDisableBodyScroll(true);

  return (
    <div
      className="w-full h-full bg-cover bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: "url(/assets/images/home/home-bg.png)" }}
    >
      <div className="absolute -bottom-10 right-0 left-0 pointer-events-none">
        <img
          src="/assets/images/common/main-item.svg"
          alt="Home"
          className="w-[180%] ml-[-48%] max-w-[180%] mx-auto relative z-20"
        />
      </div>
      <div className="absolute top-[100px] left-5 right-5 h-[360px] bg-no-repeat p-5">
        <img
          src="/assets/images/common/big-frame.png"
          alt="Home"
          className="w-full h-full absolute top-0 left-0 right-0 bottom-0"
        />
        <div className="w-full h-full no-scrollbar flex items-start max-h-[360px]">
          <div className="h-[400px] mx-auto  no-scrollbar">
            <h2 className="text-center uppercase text-white font-bold text-[24px] leading-[28px] relative mt-2">
              Hãy đăng nhập để bắt đầu chơi nào
            </h2>
            <div className="flex flex-col gap-4 mt-5">
              <TextInput
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e })}
                placeholder="Số điện thoại"
              />
              <PasswordInput
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e })}
                placeholder="Mật khẩu"
              />
              <div className="flex text-[12px] items-center text-white relative">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={formData.checkbox}
                    onChange={(e) =>
                      setFormData({ ...formData, checkbox: e.target.checked })
                    }
                  />
                  <span className=" ml-2"> Ghi nhớ mật khẩu</span>
                </div>
                <div onClick={onClickQuenMatKhau} className="ml-auto">
                  Quên mật khẩu
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-2 relative z-30">
              {isLoading ? (
                <p className="text-white self-center mt-4 font-semibold text-center underline whitespace-nowrap">
                  Đang xử lý
                </p>
              ) : (
                <ImageButton
                  text="Chơi ngay"
                  textClassName="text-white font-bold uppercase text-[14px]"
                  onClick={handleConfirm}
                  altText="Chơi ngay"
                  imageSrc="/assets/images/common/gradient-btn-frame.svg"
                  className="w-[150px] mx-auto"
                />
              )}
            </div>
            <div className="flex justify-center mt-2 z-30 relative">
              <ImageButton
                text="Tạo thông tin"
                textClassName="text-white font-bold uppercase text-[14px]"
                onClick={onRegister}
                altText="Tạo thông tin"
                imageSrc="/assets/images/common/gradient-btn-frame.svg"
                className="w-[150px] mx-auto"
              />
            </div>
            <p className="text-[9px] text-white mt-2 text-center font-medium relative">
              Nếu chưa có thông tin, hãy tạo thông tin Thợ Săn để cùng thử tài
              săn điểm thưởng ngay bạn nhé
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 left-0 flex justify-center items-center">
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

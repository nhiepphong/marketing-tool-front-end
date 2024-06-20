import { useDispatch, useSelector } from "react-redux";
import { ImageButton, PasswordInput, TextInput } from "../components";
import { getUserData, updateData } from "../redux/slices/userSlices";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      navigate("/");
    }
  }, [dataUser]);

  const createAccount = async () => {
    if (formData.password === formData.rePassword) {
      setIsLoading(true);

      const result: any = await postRegister(formData);

      if (result.status == 200) {
        if (result.data.status) {
          showToast({ type: "success", message: result.data.message });
          dispatch(updateData(result.data.data));
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
    <div
      className="w-full h-full bg-cover bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: "url(/assets/images/home/home-bg.png)" }}
    >
      <div className="absolute top-[100px] left-5 right-5 bottom-0 p-5 h-[63%]">
        <img
          src="/assets/images/common/big-frame.png"
          alt="Home"
          className="w-full h-full absolute top-0 left-0 right-0 bottom-0"
        />
        <div className="w-full h-full overflow-x-hidden overflow-y-scroll no-scrollbar">
          <h2 className="text-center uppercase text-white font-medium relative text-[22px]">
            Hãy tạo thông tin
            <br />
            <strong> Thợ săn </strong>
            <br />
            Để bắt đầu chơi nào
          </h2>
          <div className="flex flex-col gap-4 mt-5">
            <TextInput
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e })}
              placeholder="Tên"
            />
            <div>
              <TextInput
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e })}
                placeholder="SĐT (*)"
              />
              <p className="text-[9px] text-white relative mt-3 font-bold">
                [*] Lưu ý, cần nhập đúng sđt đã đăng ký thành viên AEON để hệ
                thống trả thưởng khi bạn hoàn thành thử thách.
              </p>
            </div>
            <TextInput
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e })}
              placeholder="Email"
            />
            <PasswordInput
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e })}
              placeholder="Mật khẩu"
            />
            <PasswordInput
              value={formData.rePassword}
              onChange={(e) => setFormData({ ...formData, rePassword: e })}
              placeholder="Nhập lại mật khẩu"
            />
            <div className="flex text-[12px] items-center text-white relative">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  onChange={() => console.log}
                />
                <span className=" ml-2"> Ghi nhớ mật khẩu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-20 right-0 left-0 flex justify-center items-center">
        {isLoading ? (
          <p className="text-white self-center mt-4 font-semibold text-center underline whitespace-nowrap">
            Đang xử lý
          </p>
        ) : (
          <ImageButton
            text="Tạo thông tin"
            textClassName="text-white font-bold uppercase text-[18px] mt-1"
            onClick={createAccount}
            altText="Login"
            imageSrc="/assets/images/common/gradient-btn-frame.svg"
            className="w-[180px] mx-auto"
          />
        )}
      </div>
      <div className="absolute bottom-1 right-0 left-0 flex justify-center items-center">
        <ImageButton
          text="Xem thêm ưu đãi khác"
          textClassName="text-[11px] text-white uppercase font-bold"
          imageSrc="/assets/images/common/uu-dai-btn.svg"
          className="mx-auto w-44"
          altText="Play"
          onClick={() => {
            window.open(URL_API.XEM_THEM, "_blank");
          }}
        />
      </div>
    </div>
  );
}

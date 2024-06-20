import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleImagePopup } from "../redux/slices/popupSlices";
import { ImageButton } from "./button";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div className="flex px-5 items-center justify-between absolute top-3 left-0 right-0">
      <img
        onClick={() => {
          navigate("/");
        }}
        src="/assets/images/common/logo.svg"
        alt="bar-icon"
        className="w-10 h-10 cursor-pointer"
      />
      <img
        onClick={() => {
          navigate("/");
        }}
        src="/assets/images/common/slogan.svg"
        alt="bar-icon"
        className="w-48 h-48 absolute -top-[130%] right-1/2 translate-x-1/2"
      />
    </div>
  );
}

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { closePopup } from "../redux/slices/popupSlices.ts";

export default function PopUp() {
  const { isOpen, content, background, height } = useSelector(
    (state: any) => state.popup
  );
  const pathname = useLocation().pathname;
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(closePopup());
  }, [dispatch, pathname]);

  if (!isOpen) return null;
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-[10000]"></div>
      <div
        className={`modal-container w-[90%] flex justify-center absolute z-[10001] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-40 opacity-0 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ height: `${height}%` }}
      >
        <div
          className="flex flex-col justify-center items-center p-2 h-full rounded-3xl shadow-sm max-w-[95%] relative bg-no-repeat bg-cover w-full"
          style={{
            background:
              background === "image"
                ? "url(/assets/images/common/big-frame.png) no-repeat center center / 100% 100%"
                : "white",
          }}
        >
          <div
            className={`z-10 hover:cursor-pointer absolute right-3 top-1 ${
              background === "image" ? "text-white" : "text-[#be0b94]"
            }`}
            onClick={() => {
              dispatch(closePopup());
            }}
          >
            <CloseIcon />
          </div>
          <div className="p-2 w-full h-full overflow-auto no-scrollbar">
            {content}
          </div>
        </div>
      </div>
    </>
  );
}

const CloseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={34}
      height={34}
      viewBox="0 0 34 34"
      fill="none"
    >
      <path
        d="M21.2426 12.7573L12.7574 21.2426M21.2426 21.2426L12.7574 12.7573"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
};

import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "../components/Header";
import PopUp from "../components/PopUp";

export const LayoutClient = () => {
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div
        ref={rootRef}
        className="bg-white shadow rounded max-w-full min-[450px]:max-w-xs  w-full h-screen min-[450px]:h-[702px] max-h-screen overflow-auto relative"
        // className="bg-white shadow rounded max-w-full min-[450px]:max-w-xs  w-full h-screen max-h-screen overflow-auto relative"
      >
        <PopUp />
        <div className="w-full h-full relative">
          <Outlet />
          <Header />
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

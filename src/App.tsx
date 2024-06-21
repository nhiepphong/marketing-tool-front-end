import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import DataContext from "./context/DataContext";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { LayoutClient } from "./layout/Layout";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Logout from "./pages/logout";
import QuenMatKhau from "./pages/quen-mat-khau";
import ProtectedLogin from "./components/auth/ProtectedLogin";
import ProtectedRouter from "./components/auth/ProtectedRouter";
import { ToastContainer } from "react-toastify";
import { getNewTokenByAPI } from "./api/user";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, updateData } from "./redux/slices/userSlices";
import Profile from "./pages/profile";
import PackagesPage from "./pages/packages";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { element: <Navigate to="/login" />, index: true },
      {
        path: "/login",
        element: <ProtectedLogin props={<Login />} type={""} key={""} />,
      },
      {
        path: "/register",
        element: <ProtectedLogin props={<Register />} type={""} key={""} />,
      },
      {
        path: "/quen-mat-khau",
        element: <ProtectedLogin props={<QuenMatKhau />} type={""} key={""} />,
      },
    ],
  },
  {
    path: "/app/*",
    element: <ProtectedRouter />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "page/:id",
        element: <Home />,
      },
      {
        path: "account",
        element: <Profile />,
      },
      {
        path: "subscription",
        element: <PackagesPage />,
      },
      {
        path: "*",
        element: <Home />,
      },
    ],
  },
  {
    path: "/",
    element: <LayoutClient />,
    children: [
      {
        path: "logout",
        element: <Logout />,
      },
    ],
  },
]);

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

function App() {
  const dataUser = useSelector(getUserData);
  const [isNeedGetNewToken, setIsNeedGetNewToken] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (isNeedGetNewToken && dataUser) {
      getNewToken();
    }
  }, [isNeedGetNewToken]);

  useEffect(() => {
    if (dataUser) {
      getNewToken();
    }
  }, []);

  const getNewToken = async () => {
    setIsNeedGetNewToken(false);
    const result = await getNewTokenByAPI(
      { refreshToken: dataUser.token.refreshToken },
      dataUser.token.accessToken
    );

    if (result?.status === 200) {
      dispatch(
        updateData({
          token: {
            refreshToken: dataUser.token.refreshToken,
            accessToken: result.data.accessToken,
          },
          user: dataUser.user,
        } as any)
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DataContext.Provider
        value={{
          isNeedGetNewToken,
          setIsNeedGetNewToken,
        }}
      >
        <RouterProvider router={router} />
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
      </DataContext.Provider>
    </div>
  );
}

export default App;

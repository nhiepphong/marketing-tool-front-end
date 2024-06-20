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

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { element: <Navigate to="/login" />, index: true },
      {
        path: "/login",
        element: <ProtectedLogin props={<Login />} type={""} key={""} />,
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
        path: "logout",
        element: <Logout />,
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
        path: "/quen-mat-khau",
        element: <QuenMatKhau />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "*",
        element: <Home />,
      },
    ],
  },
]);

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

function App() {
  const [statusGame, setStatusGame] = useState("");
  const [isVisited, setIsVisited] = useState(false);

  return (
    <div className="bg-[#000000] flex flex-col min-h-screen safe-top safe-bottom">
      <DataContext.Provider
        value={{
          statusGame,
          setStatusGame,
          isVisited,
          setIsVisited,
        }}
      >
        <RouterProvider router={router} />
      </DataContext.Provider>
    </div>
  );
}

export default App;

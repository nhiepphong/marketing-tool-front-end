import { Link, useNavigate } from "react-router-dom";
import { ImageButton, PasswordInput, TextInput } from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserData,
  getUsertErr,
  loginUser,
  logout,
} from "../redux/slices/userSlices";
import { useEffect, useState } from "react";
import { ValuePropsGetUser } from "../utils/interface.global";
import { URL_API } from "../constants/api";

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logout());
    navigate("/page/8s66WjsLb75XnPEW");
  }, []);

  return (
    <div
      className="w-full h-full bg-cover bg-no-repeat relative overflow-hidden min-h-[727px]"
      style={{ backgroundImage: "url(/assets/images/home/home-bg.png)" }}
    ></div>
  );
}

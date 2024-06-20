import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserData } from "../../redux/slices/userSlices";
import useAuth from "../../hooks/useAuthentication";

const ProtectedLogin = ({ props }: React.ReactElement) => {
  const isAuthed: boolean = useAuth();
  const user = useSelector(getUserData);
  return isAuthed ? <Navigate to={"/app"} replace /> : props;
};

export default ProtectedLogin;

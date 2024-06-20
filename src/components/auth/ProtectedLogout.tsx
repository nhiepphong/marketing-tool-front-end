import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { logout } from "../../redux/slices/userSlices";

const ProtectedLogout = () => {
  const dispatch = useDispatch();
  dispatch(logout());
  return <Navigate to={"/"} replace />;
};

export default ProtectedLogout;

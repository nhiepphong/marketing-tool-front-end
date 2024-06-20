import { useSelector } from "react-redux";
import { getUserStatus } from "../redux/slices/userSlices";

const useAuth = () => {
  const status = useSelector(getUserStatus);
  if (!status) return false;
  return true;
};

export default useAuth;

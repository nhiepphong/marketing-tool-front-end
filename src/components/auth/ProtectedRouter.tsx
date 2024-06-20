import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuthentication";
import { LayoutClient } from "../../layout/Layout";

const ProtectedRouter = () => {
  const isAuthed: boolean = useAuth();

  return isAuthed ? <LayoutClient /> : <Navigate to={"/"} replace />;
};

export default ProtectedRouter;

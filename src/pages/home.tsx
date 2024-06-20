import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return <div>Home</div>;
}

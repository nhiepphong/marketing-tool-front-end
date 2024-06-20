import { toast } from "react-toastify";

type ToastType = "success" | "warning" | "error" | "info";

export const showToast = ({
  message,
  type,
}: {
  message: string;
  type: ToastType;
}) => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast.info(message);
  }
};

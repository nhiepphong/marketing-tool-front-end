import { createContext } from "react";

export interface GLOBALDIALOG {
  isOpen: boolean;
  data: {
    title: string;
    buttonTitle: string;
    description: string;
  } | null;
}
const DataContext = createContext<{
  isNeedGetNewToken: boolean;
  setIsNeedGetNewToken: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export default DataContext;

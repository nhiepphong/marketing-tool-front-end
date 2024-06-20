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
  statusGame: string;
  setStatusGame: React.Dispatch<React.SetStateAction<string>>;
  isVisited: boolean;
  setIsVisited: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export default DataContext;

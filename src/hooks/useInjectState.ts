import { useEffect, useState } from "react";

interface InjectWindow extends Window {
  latestStoreState: any;
}

export default function useInjectState() {
  const [state, setState] = useState(
    (window.parent as InjectWindow).latestStoreState
  );

  useEffect(() => {
    function handleChange() {
      setState((window.parent as InjectWindow).latestStoreState);
    }

    window.parent.addEventListener("change", handleChange);

    return () => {
      window.parent.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    console.log("Web stage change", state);
  }, [state]);

  return state;
}

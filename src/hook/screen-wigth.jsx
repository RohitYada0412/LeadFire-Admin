import { useEffect, useState } from "react";

const useGetWidthAndHeight = () => {
  const getWidthAndHeight = () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };
  const [screenSize, setScreenSize] = useState(getWidthAndHeight());

  useEffect(() => {
    const updataScreenSize = () => {
      setScreenSize(getWidthAndHeight());
    };
    window.addEventListener("resize", updataScreenSize);

    return () => window.removeEventListener("resize", updataScreenSize);
  }, [screenSize]);
  return screenSize;
};  

export default useGetWidthAndHeight;
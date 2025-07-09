import React, { useEffect } from "react";

const LoadingAnimation = () => {
  useEffect(() => {
    document.documentElement.classList.add("overflow-hidden");
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center ">
      <div className="w-20 h-20 border-t-2 border-r-2 border-white rounded-full animate-spin" />
    </div>
  );
};

export default LoadingAnimation;

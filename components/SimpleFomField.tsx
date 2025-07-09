import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface FormValues {
  email: string;
  password: string;
}

const SimpleFormField = ({
  title,
  handleChaneText,

  type,
  value,
  placeHolder,
}: {
  value: string;
  title: any;
  type?: string;
  handleChaneText: any;
  placeHolder: string;
}) => {
  return (
    <div className="mt-4 w-full">
      <label className="block text-sm font-bold text-gray-700">{title}</label>
      <div
        className={`flex flex-row justify-between rounded-md w-full shadow-md  bg-gray-100 h-11 hover:shadow-blue-300`}
      >
        <input
          type={type || "text"}
          formNoValidate
          value={value}
          onChange={handleChaneText}
          className="w-[85%] px-4 bg-transparent focus:outline-none text-gray-600"
          placeholder={placeHolder}
          required
        />
      </div>
    </div>
  );
};

export default SimpleFormField;

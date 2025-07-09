import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface FormValues {
  email: string;
  password: string;
}

const FormField = ({
  item,
  focuedValues,
  hidePassword,
  setFocusedValues,
  setFormValues,
  formValues,
  setHidePassword,
}: {
  item: any;
  focuedValues: any;
  hidePassword?: boolean;
  setFocusedValues?: any;
  setFormValues?: any;
  formValues: any;
  setHidePassword?: any;
}) => {
  return (
    <div className="mt-4 w-full" key={item.id}>
      <label className="block text-sm font-bold text-gray-700">
        {item.label}
      </label>
      <div
        className={`flex flex-row justify-between rounded-md w-full shadow-blue-200 shadow-md ${
          focuedValues[item.variable as keyof FormValues] && "shadow-blue-300"
        } bg-gray-100 h-11  hover:shadow-blue-300`}
      >
        <input
          type={
            item.placeHolder !== "••••••••••••"
              ? item.variable
              : hidePassword
              ? "password"
              : "text"
          }
          formNoValidate
          id={item.id}
          value={formValues[item.variable as keyof FormValues]}
          onFocus={() =>
            setFocusedValues({ ...focuedValues, [item.variable]: true })
          }
          onBlur={() =>
            setFocusedValues({
              ...focuedValues,
              [item.variable]: false,
            })
          }
          onChange={(e) =>
            setFormValues({
              ...formValues,
              [item.variable]: e.target.value,
            })
          }
          className="w-[85%] px-4 bg-transparent focus:outline-none  focus:shadow-blue-600 text-gray-600"
          placeholder={item.placeHolder}
          required
        />
        {item.placeHolder === "••••••••••••" && (
          <div
            className="h-full w-[15%] flex items-center justify-center cursor-pointer"
            onClick={() => setHidePassword(!hidePassword)}
          >
            {hidePassword ? (
              <FaEye className="text-black" size={20} />
            ) : (
              <FaEyeSlash className="text-black" size={20} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormField;

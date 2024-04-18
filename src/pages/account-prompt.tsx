import React, { useState } from "react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import Layout from "@/components/layout/layout";

const AccountPrompt: React.FC = () => {
  const router = useRouter();
  const hello = trpc.hello.useQuery({ text: "client" });
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let input = event.target.value.replace(/\D/g, "");
    if (input.length > 4) {
      input = input.slice(0, 4) + " " + input.slice(4);
    }
    setPhoneNumber(input.slice(0, 9));
  };

  const validatePhoneNumber = (): boolean => {
    const digits = phoneNumber.replace(/\s/g, "");
    if (digits.length !== 8 || (digits[0] !== "8" && digits[0] !== "9")) {
      setErrorMessage("Please enter a valid phone number.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleSendCode = async () => {
    if (validatePhoneNumber()) {
      try {
        const digits = phoneNumber.replace(/\s/g, ""); // Remove spaces
        const response = await fetch(
          `http://192.168.43.47:3000/api/user?phoneNumber=${digits}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const userId = data;
        router.push(`/recycle-item?userId=${userId}`);
      } catch (error) {
        console.error("Error:", error);
        setErrorMessage((error as Error).message);
      }
    }
  };

  const handleNoAccount = () => {
    router.push("/recycle-item");
  };

  const handleDigitClick = (digit: number) => {
    let newPhoneNumber = phoneNumber + digit.toString();
    newPhoneNumber = newPhoneNumber.replace(/\D/g, "");
    if (newPhoneNumber.length > 4) {
      newPhoneNumber =
        newPhoneNumber.slice(0, 4) + " " + newPhoneNumber.slice(4);
    }
    setPhoneNumber(newPhoneNumber.slice(0, 9));
  };

  const handleBackClick = () => {
    setPhoneNumber((prevPhoneNumber) => {
      if (prevPhoneNumber.endsWith(" ")) {
        return prevPhoneNumber.slice(0, -2);
      }
      return prevPhoneNumber.slice(0, -1);
    });
  };

  if (!hello.data) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div>
        <h1 className="mt-6 text-center text-6xl font-bold leading-9 tracking-tight text-gray-900">
          Phone Login
        </h1>
        <h2 className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-gray-900">
          Enter your phone number
        </h2>
        <div className="relative mt-10 rounded-md shadow-sm bg-white">
          <div className="flex flex-row items-center">
            <input
              type="text"
              className="appearance-none bg-transparent border-none w-20 text-2xl py-4 px-4 leading-tight focus:outline-none"
              placeholder="+65"
              value="+65"
              readOnly
            />
            <span className="text-gray-500 text-xl">|</span>
            <input
              type="tel"
              className="appearance-none bg-transparent border-none w-full text-2xl py-4 px-4 leading-tight focus:outline-none"
              placeholder="9123 4567"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
            />
          </div>
        </div>
        {errorMessage && (
          <p className="mt-7 text-center text-2xl font-bold text-red-500">
            {errorMessage}
          </p>
        )}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigitClick(digit)}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleBackClick}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded"
          >
            Back
          </button>
        </div>
        <button
          onClick={handleSendCode}
          type="button"
          className="mt-10 mx-auto block rounded-md bg-green-500 px-20 py-5 text-2xl font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
        >
          Login
        </button>
        <button
          onClick={handleNoAccount}
          type="button"
          className="absolute bottom-20 right-20 mt-10 rounded-md bg-red-500 px-20 py-5 text-2xl font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          No Account
        </button>
      </div>
    </Layout>
  );
};

export default AccountPrompt;

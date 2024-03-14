import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import Layout from "@/components/layout/layout";

const OtpVerification: React.FC = () => {
  const router = useRouter();
  const hello = trpc.hello.useQuery({ text: "client" });

  const input1 = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const input3 = useRef<HTMLInputElement>(null);
  const input4 = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!hello.data) {
    return <div>Loading...</div>;
  }

  const focusNextInput = (nextInput: React.RefObject<HTMLInputElement>) => {
    nextInput.current?.focus();
  };

  const handleVerify = () => {
    const otp = `${input1.current?.value}${input2.current?.value}${input3.current?.value}${input4.current?.value}`;
    if (otp.length !== 4) {
      setErrorMessage("OTP needs to be 4 digits");
    } else {
      console.log(otp);
      router.push("/recycle-item");
      setErrorMessage(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        <div>
          <h1 className="mt-6 text-center text-6xl font-bold leading-9 tracking-tight text-gray-900">
            OTP Verification
          </h1>
          <h2 className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-gray-900">
            Enter OTP
          </h2>

          <div className="mt-10 flex flex-row items-center justify-between mx-auto w-full max-w-xs">
            <div className="w-20 h-20 mr-4">
              <input
                className="w-full h-full text-center outline-none rounded-xl border border-gray-200 text-2xl bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                type="text"
                maxLength={1}
                ref={input1}
                onChange={(e) => {
                  if (e.target.value !== "") {
                    focusNextInput(input2);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    (e.target as HTMLInputElement).value === ""
                  ) {
                    // Do nothing
                  }
                }}
              />
            </div>
            <div className="w-20 h-20 mr-4">
              <input
                className="w-full h-full text-center outline-none rounded-xl border border-gray-200 text-2xl bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                type="text"
                maxLength={1}
                ref={input2}
                onChange={(e) => {
                  if (e.target.value !== "") {
                    focusNextInput(input3);
                  } else {
                    focusNextInput(input1);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    (e.target as HTMLInputElement).value === ""
                  ) {
                    focusNextInput(input1);
                  }
                }}
              />
            </div>
            <div className="w-20 h-20 mr-4">
              <input
                className="w-full h-full text-center outline-none rounded-xl border border-gray-200 text-2xl bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                type="text"
                maxLength={1}
                ref={input3}
                onChange={(e) => {
                  if (e.target.value !== "") {
                    focusNextInput(input4);
                  } else {
                    focusNextInput(input2);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    (e.target as HTMLInputElement).value === ""
                  ) {
                    focusNextInput(input2);
                  }
                }}
              />
            </div>
            <div className="w-20 h-20 mr-4">
              <input
                className="w-full h-full text-center outline-none rounded-xl border border-gray-200 text-2xl bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                type="text"
                maxLength={1}
                ref={input4}
                onChange={(e) => {
                  if (e.target.value === "") {
                    focusNextInput(input3);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    (e.target as HTMLInputElement).value === ""
                  ) {
                    focusNextInput(input3);
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col items-center">
          {errorMessage && (
            <p className="text-2xl font-bold text-red-500">{errorMessage}</p>
          )}

          <p className="mt-8 text-xl font-semibold ">
            Didn&apos;t receive code? &nbsp;
            <a
              href="#"
              className="underline text-blue-500 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              Resend
            </a>
          </p>

          <button
            onClick={handleVerify}
            type="button"
            className="mt-10 rounded-md bg-green-500 px-20 py-5 text-2xl font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
          >
            Verify
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default OtpVerification;

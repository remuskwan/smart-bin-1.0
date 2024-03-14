import React, { ReactNode } from "react";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { useRouter } from "next/router";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  const navigateToIndex = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#F4EDCC]">
      <div className="flex items-center mt-10 cursor-pointer" onClick={navigateToIndex}>
        <h1 className="text-9xl font-bold">SortWise</h1>
        <Image src={logo} alt="logo" className="h-24 w-24" />
      </div>
      <div className="flex-grow flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default Layout;
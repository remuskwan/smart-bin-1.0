import "@/styles/globals.css";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
};

export default trpc.withTRPC(MyApp);

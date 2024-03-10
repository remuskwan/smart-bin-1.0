import "@/styles/globals.css";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { Inter } from "next/font/google";
import Head from "next/head";
import logo from "@/assets/logo.png";

const inter = Inter({ subsets: ["latin"] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <link rel="icon" href={logo.src} type="image/png" />
        <title>SortWise</title>
      </Head>
      <main className={inter.className}>
        <Component {...pageProps} />
      </main>
    </>
  );
};

export default trpc.withTRPC(MyApp);

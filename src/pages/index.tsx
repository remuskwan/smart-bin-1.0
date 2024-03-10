import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import Layout from "@/components/layout/layout";

export default function Home() {
  const router = useRouter();
  const hello = trpc.hello.useQuery({ text: "client" });

  const handleRecycleClick = () => {
    router.push("/account-prompt");
  };

  if (!hello.data) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <button
        onClick={handleRecycleClick}
        type="button"
        className="bg-green-500 text-white text-9xl px-20 py-10 inline-block text-center rounded-lg transition duration-500 ease-in-out transform hover:-translate-y-1 active:scale-90"
      >
        Recycle Item
      </button>
    </Layout>
  );
}

import { trpc } from "@/utils/trpc";
import Layout from "@/components/layout/layout";

export default function Home() {
  const hello = trpc.hello.useQuery({ text: "client" });
  if (!hello.data) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <a
        href="/recycle-item"
        className="bg-green-400 text-white text-9xl px-20 py-10 inline-block text-center rounded-lg transition duration-500 ease-in-out transform hover:-translate-y-1 active:scale-90"
      >
        Recycle Item
      </a>
    </Layout>
  );
}

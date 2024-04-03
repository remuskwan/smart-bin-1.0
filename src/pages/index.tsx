import { useRouter } from "next/router";
import Layout from "@/components/layout/layout";
import { useQuerySubscription } from "@/hooks/subscribe.hook";

export default function Home() {
  const router = useRouter();

  const handleRecycleClick = () => {
    router.push("/account-prompt");
  };

  useQuerySubscription();

  return (
    <Layout>
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-1rem);
          }
        }
      `}</style>
      <button
        onClick={handleRecycleClick}
        type="button"
        className="bg-green-500 text-white text-9xl px-20 py-10 inline-block text-center rounded-lg transition duration-500 ease-in-out transform hover:animate-bounce active:scale-90"
      >
        Recycle Item
      </button>
    </Layout>
  );
}

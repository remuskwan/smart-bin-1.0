import { trpc } from "@/utils/trpc";
import Layout from "@/components/layout/layout";

const RecycleItem: React.FC = () => {
  const hello = trpc.hello.useQuery({ text: "client" });

  if (!hello.data) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <h2
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
        }}
        className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-gray-600"
      >
        No item detected.
      </h2>
      <div
        style={{
          backgroundColor: "black",
          width: "55vw",
          height: "60vh",
          position: "absolute",
          top: "56%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </Layout>
  );
};

export default RecycleItem;

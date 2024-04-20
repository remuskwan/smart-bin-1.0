import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import Layout from "@/components/layout/layout";
import CameraFeed from "./camera-feed";

const RecycleItem: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query; // Capture userId from query parameters

  const hello = trpc.hello.useQuery({ text: "client" });

  if (!hello.data) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <CameraFeed userId={userId as string | undefined} />{" "}
      {/* Pass userId as a prop to CameraFeed only if it exists */}
    </Layout>
  );
};

export default RecycleItem;

import TextCanvas from "~/components/TextCanvas";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="flex text-center items-center justify-center h-screen my-20">
      <TextCanvas />
    </div>
  );
}

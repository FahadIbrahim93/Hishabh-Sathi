import { createFileRoute } from "@tanstack/react-router";
import { HishabApp } from "@/components/hishab/app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <HishabApp />;
}

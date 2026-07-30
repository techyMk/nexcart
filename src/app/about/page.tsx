import type { Metadata } from "next";
import { AboutView } from "./about-view";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "NexCart is an AI-native ecommerce platform that learns your taste, curates the right products and delivers them fast — trusted by 50K+ customers across 120+ countries.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutView />;
}

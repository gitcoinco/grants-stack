import Hero from "@/components/homepage/Hero";
import HomeNav from "@/components/homepage/HomeNav";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen ">
      <Hero />
      <HomeNav />
    </main>
  );
}

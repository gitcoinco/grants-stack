import Hero from "@/components/landingpage/Hero";
import HomeNav from "@/components/landingpage/HomeNav";

export default function Home() {
  return (
    <main className="items-center justify-between min-h-screen ">
      <Hero />
      <HomeNav />
    </main>
  );
}

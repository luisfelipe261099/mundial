import { Closing } from "./_components/closing";
import { MobileBar } from "./_components/floating";
import { Footer } from "./_components/footer";
import { Hero } from "./_components/hero";
import { Location } from "./_components/location";
import { Nav } from "./_components/nav";
import { Process } from "./_components/process";
import { Reviews } from "./_components/reviews";
import { Services } from "./_components/services";
import { Structure } from "./_components/structure";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Services />
        <Process />
        <Reviews />
        <Structure />
        <Location />
        <Closing />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}

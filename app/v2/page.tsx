import { Closing } from "./_components/closing";
import { Floating } from "./_components/floating";
import { Footer } from "./_components/footer";
import { Hero } from "./_components/hero";
import { Location } from "./_components/location";
import { Marquee } from "./_components/marquee";
import { Nav } from "./_components/nav";
import { Proof } from "./_components/proof";
import { Reviews } from "./_components/reviews";
import { Services } from "./_components/services";

export default function V2Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Proof />
        <Reviews />
        <Location />
        <Closing />
      </main>
      <Footer />
      <Floating />
    </>
  );
}

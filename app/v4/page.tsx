import { Bento } from "./_components/bento";
import { Closing } from "./_components/closing";
import { Floating } from "./_components/floating";
import { Footer } from "./_components/footer";
import { Hero } from "./_components/hero";
import { Location } from "./_components/location";
import { Nav } from "./_components/nav";
import { Numbers } from "./_components/numbers";
import { Services } from "./_components/services";
import { Showcase } from "./_components/showcase";
import { Testimonial } from "./_components/testimonial";

export default function V4Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Showcase />
        <Bento />
        <Services />
        <Numbers />
        <Testimonial />
        <Location />
        <Closing />
      </main>
      <Footer />
      <Floating />
    </>
  );
}

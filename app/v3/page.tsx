import { Chapters } from "./_components/chapters";
import { Closing } from "./_components/closing";
import { Floating } from "./_components/floating";
import { Footer } from "./_components/footer";
import { Hero } from "./_components/hero";
import { Location } from "./_components/location";
import { Manifesto } from "./_components/manifesto";
import { Nav } from "./_components/nav";
import { Numbers } from "./_components/numbers";
import { Services } from "./_components/services";
import { Strip } from "./_components/strip";
import { Testimonial } from "./_components/testimonial";

export default function V3Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Strip />
        <Manifesto />
        <Chapters />
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

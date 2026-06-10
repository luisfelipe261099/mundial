import { Footer } from "../_components/footer";
import { FinalCta } from "../_components/final-cta";
import { GarageBand } from "../_components/garage-band";
import { Hero } from "../_components/hero";
import { Location } from "../_components/location";
import { MobileCtaBar } from "../_components/mobile-cta-bar";
import { Services } from "../_components/services";
import { SiteHeader } from "../_components/site-header";
import { StatsStrip } from "../_components/stats-strip";
import { Testimonials } from "../_components/testimonials";
import { WhatsAppFab } from "../_components/whatsapp-fab";
import { WhyUs } from "../_components/why-us";

// Opção A ("Confiança Clara") — versão original, agora em /v1.
// O / passou a ser a página de seleção das versões.
export default function V1Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <StatsStrip />
        <Services />
        <WhyUs />
        <GarageBand />
        <Testimonials />
        <Location />
        <FinalCta />
      </main>
      <Footer />
      {/* Espaço pra barra fixa não cobrir o rodapé no mobile */}
      <div aria-hidden className="h-20 md:hidden" />
      <WhatsAppFab />
      <MobileCtaBar />
    </>
  );
}

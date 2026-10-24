import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TechMarquee from "@/components/TechMarquee";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import Pricing from "@/components/Pricing";
import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import CTAFinal from "@/components/CTAFinal";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CursorGlow from "@/components/CursorGlow";
import SplashScreen from "@/components/SplashScreen";
import BottomSheetCTA from "@/components/BottomSheetCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-black animated-bg relative overflow-hidden">
      <SplashScreen />
      <CursorGlow />
      <Header />
      <Hero />
      <TechMarquee />
      <Portfolio />
      <Process />
      <Pricing />
      <FAQ />

      <Gallery />
      <CTAFinal />
      <Footer />
      <FloatingWhatsApp />
      <BottomSheetCTA />
    </div>
  );
};

export default Index;

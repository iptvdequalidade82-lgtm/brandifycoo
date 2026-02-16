import Header from "@/components/Header";
import Hero from "@/components/Hero";

import Process from "@/components/Process";
import Pricing from "@/components/Pricing";

import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import CTAFinal from "@/components/CTAFinal";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const Index = () => {
  return (
    <div className="min-h-screen bg-black animated-bg relative overflow-hidden">
      <Header />
      <Hero />
      
      <Process />
      <Pricing />
      <FAQ />
      
      <Gallery />
      <CTAFinal />
      <Contact />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;

import Header from "@/components/Header";
import Hero from "@/components/Hero";

import Process from "@/components/Process";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import CTAFinal from "@/components/CTAFinal";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const Index = () => {
  return (
    <div className="min-h-screen bg-black animated-bg relative overflow-x-hidden">
      {/* Global ambient glow blobs that span across sections */}
      <div className="absolute top-[60vh] left-[-10%] w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[180px] pointer-events-none" />
      <div className="absolute top-[140vh] right-[-5%] w-[500px] h-[500px] rounded-full bg-white/[0.04] blur-[160px] pointer-events-none" />
      <div className="absolute top-[240vh] left-[10%] w-[700px] h-[700px] rounded-full bg-white/[0.03] blur-[200px] pointer-events-none" />
      <div className="absolute top-[360vh] right-[5%] w-[500px] h-[500px] rounded-full bg-white/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute top-[480vh] left-[-5%] w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[180px] pointer-events-none" />
      <Header />
      <Hero />
      
      <Process />
      <Pricing />
      <FAQ />
      <Testimonials />
      <Gallery />
      <CTAFinal />
      <Contact />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import SitePreview from "@/components/SitePreview";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Services />
      <Portfolio />
      <SitePreview />
      <Pricing />
      <Testimonials />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;

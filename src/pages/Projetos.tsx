import Header from "@/components/Header";
import Portfolio from "@/components/Portfolio";
import SitePreview from "@/components/SitePreview";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const Projetos = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <Header />
      <Portfolio />
      <SitePreview />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Projetos;

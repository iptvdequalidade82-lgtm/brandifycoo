import Header from "@/components/Header";
import Portfolio from "@/components/Portfolio";
import SitePreview from "@/components/SitePreview";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import projectsBg from "@/assets/projects-bg.jpg";

const Projetos = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-20 relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none blur-sm"
        style={{ backgroundImage: `url(${projectsBg})` }}
      />
      <Header />
      <Portfolio />
      <SitePreview />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Projetos;

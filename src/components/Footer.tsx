import logo from "@/assets/logo.jpg";

export default function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-full" />
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </span>
        </div>
        <div className="flex gap-6">
          <a href="#servicos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Serviços
          </a>
          <a href="#portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Segmentos
          </a>
          <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
}

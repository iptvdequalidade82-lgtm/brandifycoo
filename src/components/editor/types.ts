export interface BlockContent {
  [key: string]: any;
}

export interface SiteBlock {
  id: string;
  site_id: string;
  block_type: string;
  sort_order: number;
  content: BlockContent;
  visible: boolean;
}

export interface UserSite {
  id: string;
  user_id: string;
  name: string;
  slug: string | null;
  status: string;
  submitted_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockDefinition {
  type: string;
  label: string;
  icon: string;
  defaultContent: BlockContent;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "hero",
    label: "Hero / Banner",
    icon: "🖼️",
    defaultContent: {
      title: "Seu Título Principal",
      subtitle: "Uma descrição incrível do seu negócio que conquista clientes.",
      buttonText: "Saiba Mais",
      buttonLink: "#",
      backgroundImage: "",
      overlayOpacity: 50,
    },
  },
  {
    type: "about",
    label: "Sobre",
    icon: "📝",
    defaultContent: {
      title: "Sobre Nós",
      description: "Conte a história do seu negócio aqui. O que torna você especial e por que os clientes devem escolher você.",
      image: "",
      features: ["Qualidade Premium", "Atendimento Personalizado", "Entrega Rápida"],
    },
  },
  {
    type: "products",
    label: "Produtos / Serviços",
    icon: "🛍️",
    defaultContent: {
      title: "Nossos Produtos",
      subtitle: "Conheça o que temos de melhor",
      items: [
        { name: "Produto 1", description: "Descrição do produto", price: "R$ 99,90", image: "" },
        { name: "Produto 2", description: "Descrição do produto", price: "R$ 149,90", image: "" },
        { name: "Produto 3", description: "Descrição do produto", price: "R$ 199,90", image: "" },
      ],
    },
  },
  {
    type: "gallery",
    label: "Galeria",
    icon: "🖼️",
    defaultContent: {
      title: "Galeria",
      images: [] as string[],
    },
  },
  {
    type: "testimonials",
    label: "Depoimentos",
    icon: "💬",
    defaultContent: {
      title: "O que dizem nossos clientes",
      items: [
        { name: "Maria Silva", text: "Excelente serviço! Recomendo.", role: "Cliente" },
        { name: "João Santos", text: "Superou minhas expectativas.", role: "Empresário" },
      ],
    },
  },
  {
    type: "faq",
    label: "Perguntas Frequentes",
    icon: "❓",
    defaultContent: {
      title: "Perguntas Frequentes",
      items: [
        { question: "Como funciona?", answer: "Explique aqui como seu serviço funciona." },
        { question: "Qual o prazo?", answer: "Informe seus prazos de entrega." },
      ],
    },
  },
  {
    type: "contact",
    label: "Contato",
    icon: "📞",
    defaultContent: {
      title: "Entre em Contato",
      subtitle: "Estamos prontos para atender você",
      phone: "",
      email: "",
      address: "",
      whatsapp: "",
    },
  },
  {
    type: "cta",
    label: "Chamada para Ação",
    icon: "🚀",
    defaultContent: {
      title: "Pronto para Começar?",
      subtitle: "Entre em contato e transforme sua ideia em realidade.",
      buttonText: "Fale Conosco",
      buttonLink: "#",
    },
  },
];

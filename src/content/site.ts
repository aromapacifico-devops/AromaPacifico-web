export const site = {
  name: "AromaPacífico",
  title: "AromaPacífico | El origen que nos conecta",
  description:
    "Propuesta académica de arquitectura digital para acompañar el café desde la finca hasta su destino mediante monitoreo, trazabilidad y servicios de drones.",
  webRepository: "https://github.com/aromapacifico-devops/AromaPacifico-web",
  documentation: "https://github.com/aromapacifico-devops/aromapacifico-devops-docs",
  architecture:
    "https://github.com/aromapacifico-devops/aromapacifico-devops-docs/tree/main/docs/architecture/diagrams",
  visualIdentity:
    "https://github.com/aromapacifico-devops/aromapacifico-devops-docs/blob/main/docs/design/visual-identity.md",
  figma: "https://www.figma.com/design/sFAlRb7c5pxXKsQK7ZRub0/AromaPacifico",
  demoCode: "AP-7K3M-Q29X-TDHB-6",
  map: {
    country: "Colombia",
    departments: "Cauca · Huila · Tolima",
    destination: "Buenaventura",
  },
} as const;

export const modules = [
  {
    index: "01",
    eyebrow: "PARA EL CAFICULTOR",
    title: "Tu cultivo, más cerca.",
    description:
      "Prototipo con lecturas de cultivo y secado, alertas entendibles y registros preparados para escenarios sin conexión.",
    tags: ["Monitoreo", "Alertas", "Sin conexión"],
    slug: "caficultor",
    pdf: "farmer-views.pdf",
  },
  {
    index: "02",
    eyebrow: "PARA EL TRANSPORTADOR",
    title: "Cada entrega deja huella.",
    description:
      "Prototipo para el seguimiento conceptual de sacos y viajes, la recepción en centros de acopio y el registro diferido de eventos.",
    tags: ["Custodia", "Recorridos", "Offline"],
    slug: "transportador",
    pdf: "carrier-views.pdf",
  },
  {
    index: "03",
    eyebrow: "PARA QUIEN COMPRA",
    title: "Conocer el origen cambia todo.",
    description:
      "Prototipo de consulta pública mediante el código de un saco, limitado a la historia del origen y sin exponer datos sensibles.",
    tags: ["Origen", "Consulta pública", "Transparencia"],
    slug: "comprador",
    pdf: "buyer-views.pdf",
  },
] as const;

export const journey = [
  {
    number: "01",
    title: "La finca",
    subtitle: "Donde todo comienza",
    text: "Registro conceptual del cultivo, el secado y la primera identificación del saco.",
    icon: "sprout",
  },
  {
    number: "02",
    title: "Transporte",
    subtitle: "Cada movimiento cuenta",
    text: "Eventos de viaje y custodia preparados para sincronizarse tras un corte de señal.",
    icon: "truck",
  },
  {
    number: "03",
    title: "Centro de acopio",
    subtitle: "Confianza que se registra",
    text: "Recepción, validación y continuidad propuesta de la trazabilidad del saco.",
    icon: "warehouse",
  },
  {
    number: "04",
    title: "Puerto",
    subtitle: "El recorrido continúa",
    text: "Entrega conceptual en Buenaventura y registro del último evento logístico previsto.",
    icon: "ship",
  },
  {
    number: "05",
    title: "Comprador",
    subtitle: "El origen se hace visible",
    text: "Consulta pública limitada para entender la procedencia sin revelar información sensible.",
    icon: "buyer",
  },
] as const;

export type Diagram = {
  number: string;
  title: string;
  description: string;
  src: string;
  source: string;
  width: number;
  height: number;
};

const diagramBase =
  "https://github.com/aromapacifico-devops/aromapacifico-devops-docs/blob/main/docs/architecture/diagrams";

export const diagrams: readonly Diagram[] = [
  {
    number: "01",
    title: "Flujo de extremo a extremo",
    description:
      "Relaciona fincas, transporte, centros, puerto y consulta pública con sus rutas, límites de confianza e identidades.",
    src: "/architecture/01-end-to-end.drawio.png",
    source: `${diagramBase}/01-end-to-end.drawio.png`,
    width: 1824,
    height: 985,
  },
  {
    number: "03",
    title: "Conectividad y centros",
    description:
      "Explica cómo se conectaría cada sitio y cómo el diseño conserva operaciones cuando la señal no está disponible.",
    src: "/architecture/03-connectivity-and-centers.drawio.png",
    source: `${diagramBase}/03-connectivity-and-centers.drawio.png`,
    width: 1824,
    height: 947,
  },
  {
    number: "19",
    title: "Funciones de inferencia",
    description:
      "Describe el flujo propuesto, orientado a eventos, desde un registro de vuelo u objeto archivado hasta resultados de inferencia.",
    src: "/architecture/19-inference-functions.drawio.png",
    source: `${diagramBase}/19-inference-functions.drawio.png`,
    width: 2175,
    height: 1093,
  },
  {
    number: "21",
    title: "Transporte de objetos de vuelo",
    description:
      "Muestra dónde vivirían fotos, mapas, manifiestos y registros, y qué eventos llevarían cada objeto hasta su publicación.",
    src: "/architecture/21-flight-object-transport.drawio.png",
    source: `${diagramBase}/21-flight-object-transport.drawio.png`,
    width: 1985,
    height: 863,
  },
] as const;

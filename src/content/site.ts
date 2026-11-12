export const site = {
  name: "AromaPacífico",
  title: "AromaPacífico | El origen que nos conecta",
  description: "Propuesta digital para acompañar el café desde la finca hasta su destino: monitoreo, trazabilidad y tecnología para el territorio.",
  github: "https://github.com/aromapacifico-devops/aromapacifico-devops-docs",
  figma: "https://www.figma.com/design/sFAlRb7c5pxXKsQK7ZRub0/AromaPacifico",
  contact: "https://github.com/orgs/aromapacifico-devops/repositories",
  demoCode: "AP-7K3M-Q29X-TDHB-6",
  map: {
    country: "Colombia",
    departments: "Cauca · Huila · Tolima",
    destination: "Buenaventura",
  },
} as const;

export const modules = [
  { index: "01", eyebrow: "PARA EL CAFICULTOR", title: "Tu cultivo, más cerca.", description: "Lecturas de cultivo y secado, alertas entendibles y registros que siguen contigo incluso cuando falla la señal.", tags: ["Monitoreo", "Alertas", "Sin conexión"], slug: "caficultor", pdf: "farmer-views.pdf" },
  { index: "02", eyebrow: "PARA EL TRANSPORTADOR", title: "Cada entrega deja huella.", description: "Seguimiento de sacos y viajes, recepción en centros de acopio y registro de eventos aun cuando no haya datos móviles.", tags: ["Custodia", "Recorridos", "Offline"], slug: "transportador", pdf: "carrier-views.pdf" },
  { index: "03", eyebrow: "PARA QUIEN COMPRA", title: "Conocer el origen cambia todo.", description: "Consulta pública a partir del código de un saco. Una historia clara del origen, proceso y recorrido, sin revelar datos sensibles.", tags: ["Origen", "Consulta pública", "Transparencia"], slug: "comprador", pdf: "buyer-views.pdf" },
] as const;

export const journey = [
  { number: "01", title: "La finca", subtitle: "Donde todo comienza", text: "Información del cultivo, secado y primera identificación del saco.", icon: "sprout" },
  { number: "02", title: "El camino", subtitle: "Cada movimiento cuenta", text: "Eventos de transporte y custodia, incluso ante cortes de señal.", icon: "truck" },
  { number: "03", title: "El acopio", subtitle: "Confianza que se registra", text: "Recepción, validación y continuidad de la trazabilidad.", icon: "warehouse" },
  { number: "04", title: "El destino", subtitle: "Una historia verificable", text: "Entrega en Buenaventura y consulta pública limitada del origen.", icon: "ship" },
] as const;

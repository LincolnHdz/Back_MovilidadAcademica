const { createConvocatoria } = require("../models/convocatoriaModel");

const convocatoriasEjemplo = [
  {
    titulo: "Convocatoria Erasmus+ 2025",
    descripcion: "Programa de intercambio académico con universidades europeas. Incluye becas completas para estudiantes de ingeniería. Requisitos: promedio mínimo de 8.0, nivel de inglés B2, y estar en 6to semestre o superior.",
    fecha: "2025-09-30"
  },
  {
    titulo: "Convenio con Universidades de Quebec",
    descripcion: "Intercambio académico con instituciones de educación superior en Quebec, Canadá. Duración: 1 semestre académico. Incluye alojamiento y seguro médico. Fecha límite de inscripción: 15 de octubre.",
    fecha: "2025-10-15"
  },
  {
    titulo: "Movilidad de Investigación - Alemania",
    descripcion: "Oportunidad de realizar investigación en el Instituto Tecnológico de Karlsruhe (KIT). Dirigido a estudiantes de posgrado y docentes. Áreas: Ingeniería Mecánica, Sistemas y Civil. Duración: 3-6 meses.",
    fecha: "2025-11-20"
  },
  {
    titulo: "Prácticas Profesionales en Silicon Valley",
    descripcion: "Programa de prácticas profesionales en empresas tecnológicas de Silicon Valley. Dirigido a estudiantes de Ingeniería en Sistemas y afines. Duración: 3 meses. Incluye visa de trabajo y alojamiento.",
    fecha: "2025-12-01"
  },
  {
    titulo: "Intercambio Académico - Japón",
    descripcion: "Convenio con la Universidad de Tokio para intercambio académico. Áreas: Ingeniería Robótica, Automatización y Sistemas Inteligentes. Requiere conocimiento básico de japonés. Becas disponibles.",
    fecha: "2026-01-15"
  }
];

const seedConvocatorias = async () => {
  try {
    console.log("Iniciando inserción de convocatorias de ejemplo...");
    
    for (const convocatoria of convocatoriasEjemplo) {
      const nuevaConvocatoria = await createConvocatoria(convocatoria);
      console.log(`✓ Convocatoria creada: ${nuevaConvocatoria.titulo}`);
    }
    
    console.log("¡Todas las convocatorias de ejemplo han sido insertadas exitosamente!");
  } catch (error) {
    console.error("Error insertando convocatorias de ejemplo:", error);
  }
};

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
  seedConvocatorias();
}

module.exports = { seedConvocatorias };

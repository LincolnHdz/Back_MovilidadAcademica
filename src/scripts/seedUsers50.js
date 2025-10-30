const { createUser } = require("../models/userModel");
const { query, testConnection } = require("../config/database");

//cd C:\Users\juanc\OneDrive\Escritorio\movilidad\Back_MovilidadAcademica
//node src\scripts\seedUsers50.js
const firstNames = [
  "Juan", "María", "Carlos", "Ana", "Luis", "Sofía", "Miguel", "Valeria",
  "Jorge", "Fernanda", "Ricardo", "Paola", "Diego", "Daniela", "Alejandro",
  "Camila", "Eduardo", "Lucía", "Roberto", "Andrea"
];

const lastNames = [
  "Pérez", "González", "Rodríguez", "López", "Martínez", "Hernández",
  "Sánchez", "Ramírez", "Cruz", "Flores", "Torres", "Díaz", "Vargas",
  "Morales", "Ortega", "Ramos", "Cortés", "Ibarra", "Mendoza", "Navarro"
];

const movilidadValues = [
  "movilidad_internacional",
  "movilidad_virtual",
  "visitante_nacional",
  "visitante_internacional",
  null,
];

function randomOf(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDigits(n) {
  const min = Math.pow(10, n - 1);
  const max = Math.pow(10, n) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

async function fetchIds() {
  const [universidades, facultades, carreras, becas] = await Promise.all([
    query("SELECT id FROM universidades"),
    query("SELECT id FROM facultades"),
    query("SELECT id FROM carreras"),
    query("SELECT id FROM becas"),
  ]);
  return {
    universidades: universidades.rows.map((r) => r.id),
    facultades: facultades.rows.map((r) => r.id),
    carreras: carreras.rows.map((r) => r.id),
    becas: becas.rows.map((r) => r.id),
  };
}

async function seedUsers50() {
  console.log("Sembrando 50 usuarios de prueba...");
  const connected = await testConnection();
  if (!connected) {
    console.error("No hay conexión a la base de datos");
    process.exit(1);
  }

  const ids = await fetchIds();

  const usedClaves = new Set();
  const usedEmails = new Set();

  for (let i = 0; i < 50; i++) {
    const nombres = randomOf(firstNames) + " " + (Math.random() < 0.3 ? randomOf(firstNames) : "").trim();
    const apellido_paterno = randomOf(lastNames);
    const apellido_materno = randomOf(lastNames);

    // Generar clave y email únicos compatibles con validaciones
    let clave;
    do {
      clave = randomDigits(6);
    } while (usedClaves.has(clave));
    usedClaves.add(clave);

    let email;
    do {
      email = `a${clave}@alumnos.uaslp.mx`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const password = "123456";
    const rol = "alumno";
    const tipo_movilidad = randomOf(movilidadValues);

    // Asignar relaciones si existen registros; si no, dejar null
    const universidad_id = ids.universidades.length ? randomOf(ids.universidades) : null;
    const facultad_id = ids.facultades.length ? randomOf(ids.facultades) : null;
    const carrera_id = ids.carreras.length ? randomOf(ids.carreras) : null;
    const beca_id = Math.random() < 0.2 && ids.becas.length ? randomOf(ids.becas) : null;

    // Opcionalmente llenar ciclo_escolar como etiqueta simple (no afecta gráficas de applications)
    const ciclo_escolar = Math.random() < 0.5 ? `20${20 + (i % 5)}-${20 + ((i + 1) % 5)}` : null;

    try {
      const u = await createUser({
        nombres,
        apellido_paterno,
        apellido_materno,
        clave,
        telefono: null,
        email,
        password,
        rol,
        tipo_movilidad,
        ciclo_escolar,
        ciclo_escolar_inicio: null,
        ciclo_escolar_final: null,
        universidad_id,
        facultad_id,
        carrera_id,
        beca_id,
      });
      console.log(`✔ Usuario ${u.id} creado: ${u.nombres} ${u.apellido_paterno} (${u.clave})`);
    } catch (e) {
      console.warn(`⚠️  No se pudo crear usuario con clave ${clave}: ${e.message}`);
    }
  }

  console.log("Listo. 50 usuarios intentados.");
}

if (require.main === module) {
  seedUsers50()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { seedUsers50 };



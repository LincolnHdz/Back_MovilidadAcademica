const { createUser } = require("../models/userModel");

const usuariosEjemplo = [
  {
    nombres: "Juan Carlos",
    apellidos: "Pérez González",
    clave: "123456", 
    telefono: "4441234567",
    email: "a123456@alumnos.uaslp.mx",
    password: "123456",
    rol: "alumno"
  },
  {
    nombres: "María Elena",
    apellidos: "Rodríguez Martínez",
    clave: "2021030002",
    telefono: "4449876543", 
    email: "maria.rodriguez@alumnos.uaslp.mx",
    password: "123456",
    rol: "alumno"
  },
  {
    nombres: "Carlos Alberto",
    apellidos: "López Sánchez",
    clave: "2020030015",
    telefono: null, // Teléfono opcional
    email: "carlos.lopez@alumnos.uaslp.mx",
    password: "123456",
    rol: "alumno"
  },
  {
    nombres: "Ana Patricia",
    apellidos: "García Hernández",
    clave: "202203",
    telefono: "4445550123",
    email: "ana@google.com",
    password: "123456",
    rol: "alumno"
  },
  {
    nombres: "Luis Fernando",
    apellidos: "Martínez Torres",
    clave: "ADM001",
    telefono: "444-100-2000",
    email: "admin@uaslp.mx",
    password: "admin123",
    rol: "admin"
  },
];

const seedUsers = async () => {
  try {
    console.log(" Iniciando inserción de usuarios de ejemplo...");
    
    for (const usuario of usuariosEjemplo) {
      try {
        const nuevoUsuario = await createUser(usuario);
        console.log(` Usuario creado: ${nuevoUsuario.nombres} ${nuevoUsuario.apellidos} (${nuevoUsuario.clave})`);
      } catch (error) {
        if (error.message.includes("ya existe")) {
          console.log(`  Usuario ya existe: ${usuario.nombres} ${usuario.apellidos} (${usuario.clave})`);
        } else {
          console.error(` Error creando usuario ${usuario.clave}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(" Error general insertando usuarios de ejemplo:", error);
  }
};

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
  // Importar la conexión a la base de datos para poder ejecutar el seed
  const { testConnection } = require("../config/database");
  const { createUserTable } = require("../models/userModel");
  
  const runSeed = async () => {
    console.log("🔌 Probando conexión a la base de datos...");
    const connected = await testConnection();
    
    if (!connected) {
      console.error(" No se pudo conectar a la base de datos");
      return;
    }
    
    console.log(" Creando tabla de usuarios...");
    await createUserTable();
    
    await seedUsers();
  };
  
  runSeed();
}

module.exports = { seedUsers };
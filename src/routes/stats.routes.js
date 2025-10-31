const express = require("express");
const { query } = require("../config/database");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Todas las rutas de este router requieren autenticación y rol administrador
router.use(authMiddleware, requireRole(["administrador"]));

// Usuarios por universidad
router.get("/users/by-universidad", async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.nombre AS label, COUNT(us.id) AS value
       FROM universidades u
       LEFT JOIN users us ON us.universidad_id = u.id
       GROUP BY u.id, u.nombre
       ORDER BY u.nombre`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo usuarios por universidad:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Usuarios por facultad
router.get("/users/by-facultad", async (req, res) => {
  try {
    const result = await query(
      `SELECT f.id, f.nombre AS label, COUNT(us.id) AS value
       FROM facultades f
       LEFT JOIN users us ON us.facultad_id = f.id
       GROUP BY f.id, f.nombre
       ORDER BY f.nombre`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo usuarios por facultad:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Usuarios por carrera
router.get("/users/by-carrera", async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.nombre AS label, COUNT(us.id) AS value
       FROM carreras c
       LEFT JOIN users us ON us.carrera_id = c.id
       GROUP BY c.id, c.nombre
       ORDER BY c.nombre`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo usuarios por carrera:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Aplicaciones por estado
router.get("/applications/by-estado", async (req, res) => {
  try {
    const result = await query(
      `SELECT estado AS label, COUNT(*) AS value
       FROM applications
       GROUP BY estado
       ORDER BY value DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo aplicaciones por estado:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Aplicaciones por ciclo escolar
router.get("/applications/by-ciclo", async (req, res) => {
  try {
    const result = await query(
      `SELECT cicloEscolar AS label, COUNT(*) AS value
       FROM applications
       WHERE cicloEscolar IS NOT NULL
       GROUP BY cicloEscolar
       ORDER BY cicloEscolar DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo aplicaciones por ciclo:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Usuarios por tipo de movilidad
router.get("/users/by-tipo-movilidad", async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         CASE 
           WHEN tipo_movilidad IS NULL THEN 'Sin especificar'
           ELSE tipo_movilidad 
         END AS label, 
         COUNT(*) AS value
       FROM users
       GROUP BY tipo_movilidad
       ORDER BY value DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo usuarios por tipo de movilidad:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Aplicaciones por mes (últimos 12 meses)
router.get("/applications/by-month", async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         TO_CHAR(created_at, 'YYYY-MM') AS label,
         COUNT(*) AS value
       FROM applications
       WHERE created_at >= NOW() - INTERVAL '12 months'
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY label`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo aplicaciones por mes:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Usuarios registrados por mes (últimos 12 meses)
router.get("/users/by-month", async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         TO_CHAR(created_at, 'YYYY-MM') AS label,
         COUNT(*) AS value
       FROM users
       WHERE created_at >= NOW() - INTERVAL '12 months'
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY label`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo usuarios por mes:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Estadísticas filtradas por parámetros
router.get("/filtered", async (req, res) => {
  try {
    const {
      tipo = "users",
      agrupacion = "universidad",
      fecha_inicio,
      fecha_fin,
      universidad_id,
      facultad_id,
      carrera_id,
      tipo_movilidad,
      estado_aplicacion,
      ciclo_escolar,
    } = req.query;

    let query_base = "";
    let where_conditions = [];
    let params = [];
    let param_index = 1;

    // Construir condiciones WHERE
    if (fecha_inicio) {
      where_conditions.push(`created_at >= $${param_index++}`);
      params.push(fecha_inicio);
    }
    if (fecha_fin) {
      where_conditions.push(`created_at <= $${param_index++}`);
      params.push(fecha_fin);
    }
    if (universidad_id) {
      where_conditions.push(`universidad_id = $${param_index++}`);
      params.push(universidad_id);
    }
    if (facultad_id) {
      where_conditions.push(`facultad_id = $${param_index++}`);
      params.push(facultad_id);
    }
    if (carrera_id) {
      where_conditions.push(`carrera_id = $${param_index++}`);
      params.push(carrera_id);
    }
    if (tipo_movilidad) {
      where_conditions.push(`tipo_movilidad = $${param_index++}`);
      params.push(tipo_movilidad);
    }
    if (estado_aplicacion) {
      where_conditions.push(`estado = $${param_index++}`);
      params.push(estado_aplicacion);
    }
    if (ciclo_escolar) {
      where_conditions.push(`cicloEscolar = $${param_index++}`);
      params.push(ciclo_escolar);
    }

    const where_clause =
      where_conditions.length > 0
        ? `WHERE ${where_conditions.join(" AND ")}`
        : "";

    if (tipo === "users") {
      if (agrupacion === "universidad") {
        query_base = `
          SELECT u.id, u.nombre AS label, COUNT(us.id) AS value
          FROM universidades u
          LEFT JOIN users us ON us.universidad_id = u.id ${where_clause
            .replace("created_at", "us.created_at")
            .replace("universidad_id", "us.universidad_id")
            .replace("facultad_id", "us.facultad_id")
            .replace("carrera_id", "us.carrera_id")
            .replace("tipo_movilidad", "us.tipo_movilidad")}
          GROUP BY u.id, u.nombre
          ORDER BY u.nombre
        `;
      } else if (agrupacion === "facultad") {
        query_base = `
          SELECT f.id, f.nombre AS label, COUNT(us.id) AS value
          FROM facultades f
          LEFT JOIN users us ON us.facultad_id = f.id ${where_clause
            .replace("created_at", "us.created_at")
            .replace("universidad_id", "us.universidad_id")
            .replace("facultad_id", "us.facultad_id")
            .replace("carrera_id", "us.carrera_id")
            .replace("tipo_movilidad", "us.tipo_movilidad")}
          GROUP BY f.id, f.nombre
          ORDER BY f.nombre
        `;
      } else if (agrupacion === "carrera") {
        query_base = `
          SELECT c.id, c.nombre AS label, COUNT(us.id) AS value
          FROM carreras c
          LEFT JOIN users us ON us.carrera_id = c.id ${where_clause
            .replace("created_at", "us.created_at")
            .replace("universidad_id", "us.universidad_id")
            .replace("facultad_id", "us.facultad_id")
            .replace("carrera_id", "us.carrera_id")
            .replace("tipo_movilidad", "us.tipo_movilidad")}
          GROUP BY c.id, c.nombre
          ORDER BY c.nombre
        `;
      }
    } else if (tipo === "applications") {
      if (agrupacion === "estado") {
        query_base = `
          SELECT estado AS label, COUNT(*) AS value
          FROM applications
          ${where_clause}
          GROUP BY estado
          ORDER BY value DESC
        `;
      } else if (agrupacion === "ciclo") {
        query_base = `
          SELECT cicloEscolar AS label, COUNT(*) AS value
          FROM applications
          ${where_clause}
          WHERE cicloEscolar IS NOT NULL
          GROUP BY cicloEscolar
          ORDER BY cicloEscolar DESC
        `;
      } else if (agrupacion === "universidad") {
        query_base = `
          SELECT universidad AS label, COUNT(*) AS value
          FROM applications
          ${where_clause}
          GROUP BY universidad
          ORDER BY value DESC
        `;
      }
    }

    if (!query_base) {
      return res.status(400).json({
        success: false,
        message: "Parámetros de consulta no válidos",
      });
    }

    const result = await query(query_base, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo estadísticas filtradas:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Obtener opciones para filtros
router.get("/filter-options", async (req, res) => {
  try {
    const [
      universidades,
      facultades,
      carreras,
      tiposMovilidad,
      estadosAplicacion,
      ciclosEscolares,
    ] = await Promise.all([
      query("SELECT id, nombre FROM universidades ORDER BY nombre"),
      query("SELECT id, nombre FROM facultades ORDER BY nombre"),
      query("SELECT id, nombre FROM carreras ORDER BY nombre"),
      query(
        "SELECT DISTINCT tipo_movilidad FROM users WHERE tipo_movilidad IS NOT NULL ORDER BY tipo_movilidad"
      ),
      query("SELECT DISTINCT estado FROM applications ORDER BY estado"),
      // Nota: en la base actual, las aplicaciones tienen cicloEscolarInicio/Final.
      // Usaremos el campo normalizado en users.ciclo_escolar para opciones de filtro.
      query(
        "SELECT DISTINCT ciclo_escolar FROM users WHERE ciclo_escolar IS NOT NULL ORDER BY ciclo_escolar DESC"
      ),
    ]);

    return res.json({
      success: true,
      data: {
        universidades: universidades.rows,
        facultades: facultades.rows,
        carreras: carreras.rows,
        tiposMovilidad: tiposMovilidad.rows.map((r) => r.tipo_movilidad),
        estadosAplicacion: estadosAplicacion.rows.map((r) => r.estado),
        ciclosEscolares: ciclosEscolares.rows.map((r) => r.ciclo_escolar),
      },
    });
  } catch (error) {
    console.error("Error obteniendo opciones de filtros:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Estadísticas de visitantes - páginas más visitadas
router.get("/visitors/pages", async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        page_visited AS label,
        COUNT(*) AS value
      FROM visitor_logs 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY page_visited
      ORDER BY value DESC
      LIMIT 20`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo páginas más visitadas:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Estadísticas de visitantes - visitas por período
router.get("/visitors/period", async (req, res) => {
  try {
    const { period = "day" } = req.query;
    let dateFormat, interval;

    switch (period) {
      case "hour":
        dateFormat = "TO_CHAR(created_at, 'YYYY-MM-DD HH24:00')";
        interval = "1 day";
        break;
      case "day":
        dateFormat = "DATE(created_at)";
        interval = "30 days";
        break;
      case "week":
        dateFormat = "TO_CHAR(created_at, 'YYYY-WW')";
        interval = "12 weeks";
        break;
      case "month":
        dateFormat = "TO_CHAR(created_at, 'YYYY-MM')";
        interval = "12 months";
        break;
      default:
        dateFormat = "DATE(created_at)";
        interval = "30 days";
    }

    const result = await query(
      `SELECT 
        ${dateFormat} AS label,
        COUNT(*) AS value
      FROM visitor_logs 
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY ${dateFormat}
      ORDER BY label DESC`
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo visitas por período:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Estadísticas de visitantes - visitas por hora del día
router.get("/visitors/hourly", async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        EXTRACT(HOUR FROM created_at) AS label,
        COUNT(*) AS value
      FROM visitor_logs 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY label`
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error obteniendo visitas por hora:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Estadísticas generales de visitantes
router.get("/visitors/summary", async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM visitor_logs 
      WHERE created_at >= NOW() - INTERVAL '30 days'`
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error obteniendo resumen de visitantes:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

module.exports = router;

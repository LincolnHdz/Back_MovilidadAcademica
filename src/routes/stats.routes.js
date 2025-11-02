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
    return res.status(500).json({ success: false, message: "Error al obtener usuarios por universidad" });
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
    return res.status(500).json({ success: false, message: "Error al obtener usuarios por facultad" });
  }
});

// Usuarios por carrera
router.get("/users/by-carrera", async (req, res) => {
  try {
    const result = await query(
      `SELECT c.id, c.nombre AS label, c.facultad_id, COUNT(us.id) AS value
       FROM carreras c
       LEFT JOIN users us ON us.carrera_id = c.id
       GROUP BY c.id, c.nombre, c.facultad_id
       ORDER BY c.nombre`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al obtener usuarios por carrera" });
  }
});


// Aplicaciones por ciclo escolar
router.get("/applications/by-ciclo", async (req, res) => {
  try {
    const result = await query(
      `SELECT COALESCE(cicloEscolarInicio, cicloEscolarFinal) AS label, COUNT(*) AS value
       FROM applications
       WHERE cicloEscolarInicio IS NOT NULL OR cicloEscolarFinal IS NOT NULL
       GROUP BY COALESCE(cicloEscolarInicio, cicloEscolarFinal)
       ORDER BY label DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al obtener aplicaciones por ciclo" });
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
    return res.status(500).json({ success: false, message: "Error al obtener usuarios por tipo de movilidad" });
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
    return res.status(500).json({ success: false, message: "Error al obtener aplicaciones por mes" });
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
    return res.status(500).json({ success: false, message: "Error al obtener usuarios por mes" });
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
      beca_id,
      tipo_movilidad,
      ciclo_escolar_inicio,
      ciclo_escolar_final,
    } = req.query;

    let query_base = "";
    let params = [];
    let param_index = 1;

    if (tipo === "users") {
      const conditions = [];
      
      if (fecha_inicio) {
        conditions.push(`us.created_at >= $${param_index++}`);
        params.push(fecha_inicio);
      }
      if (fecha_fin) {
        conditions.push(`us.created_at <= $${param_index++}`);
        params.push(fecha_fin);
      }
      if (universidad_id) {
        conditions.push(`us.universidad_id = $${param_index++}`);
        params.push(universidad_id);
      }
      if (facultad_id) {
        conditions.push(`us.facultad_id = $${param_index++}`);
        params.push(facultad_id);
      }
      if (carrera_id) {
        conditions.push(`us.carrera_id = $${param_index++}`);
        params.push(carrera_id);
      }
      if (beca_id) {
        conditions.push(`us.beca_id = $${param_index++}`);
        params.push(beca_id);
      }
      if (tipo_movilidad) {
        conditions.push(`us.tipo_movilidad = $${param_index++}`);
        params.push(tipo_movilidad);
      }
      if (ciclo_escolar_inicio) {
        conditions.push(`us.ciclo_escolar_inicio = $${param_index++}`);
        params.push(ciclo_escolar_inicio);
      }
      if (ciclo_escolar_final) {
        conditions.push(`us.ciclo_escolar_final = $${param_index++}`);
        params.push(ciclo_escolar_final);
      }

      const where_clause = conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

      if (agrupacion === "universidad") {
        query_base = `
          SELECT u.id, u.nombre AS label, COUNT(us.id) AS value
          FROM universidades u
          LEFT JOIN users us ON us.universidad_id = u.id ${where_clause}
          GROUP BY u.id, u.nombre
          ORDER BY u.nombre`;
      } else if (agrupacion === "facultad") {
        query_base = `
          SELECT f.id, f.nombre AS label, COUNT(us.id) AS value
          FROM facultades f
          LEFT JOIN users us ON us.facultad_id = f.id ${where_clause}
          GROUP BY f.id, f.nombre
          ORDER BY f.nombre`;
      } else if (agrupacion === "carrera") {
        query_base = `
          SELECT c.id, c.nombre AS label, c.facultad_id, COUNT(us.id) AS value
          FROM carreras c
          LEFT JOIN users us ON us.carrera_id = c.id ${where_clause}
          GROUP BY c.id, c.nombre, c.facultad_id
          ORDER BY c.nombre`;
      } else if (agrupacion === "tipo_movilidad") {
        query_base = `
          SELECT 
            CASE 
              WHEN tipo_movilidad IS NULL THEN 'Sin especificar'
              ELSE tipo_movilidad 
            END AS label, 
            COUNT(*) AS value
          FROM users
          ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ").replace(/us\./g, '')}` : ''}
          GROUP BY tipo_movilidad
          ORDER BY value DESC`;
      }
    } else if (tipo === "applications") {
      const conditions = [];
      params = [];
      param_index = 1;

      if (fecha_inicio) {
        conditions.push(`created_at >= $${param_index++}`);
        params.push(fecha_inicio);
      }
      if (fecha_fin) {
        conditions.push(`created_at <= $${param_index++}`);
        params.push(fecha_fin);
      }
      if (ciclo_escolar_inicio) {
        conditions.push(`cicloEscolarInicio = $${param_index++}`);
        params.push(ciclo_escolar_inicio);
      }
      if (ciclo_escolar_final) {
        conditions.push(`cicloEscolarFinal = $${param_index++}`);
        params.push(ciclo_escolar_final);
      }

      const where_clause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      if (agrupacion === "estado") {
        query_base = `
          SELECT estado AS label, COUNT(*) AS value
          FROM applications
          ${where_clause}
          GROUP BY estado
          ORDER BY value DESC`;
      } else if (agrupacion === "ciclo") {
        const ciclo_condition = where_clause 
          ? `${where_clause} AND (cicloEscolarInicio IS NOT NULL OR cicloEscolarFinal IS NOT NULL)`
          : "WHERE (cicloEscolarInicio IS NOT NULL OR cicloEscolarFinal IS NOT NULL)";
        query_base = `
          SELECT COALESCE(cicloEscolarInicio, cicloEscolarFinal) AS label, COUNT(*) AS value
          FROM applications
          ${ciclo_condition}
          GROUP BY COALESCE(cicloEscolarInicio, cicloEscolarFinal)
          ORDER BY label DESC`;
      } else if (agrupacion === "universidad") {
        query_base = `
          SELECT universidad AS label, COUNT(*) AS value
          FROM applications
          ${where_clause}
          GROUP BY universidad
          ORDER BY value DESC`;
      } else if (agrupacion === "mes") {
        query_base = `
          SELECT TO_CHAR(created_at, 'YYYY-MM') AS label, COUNT(*) AS value
          FROM applications
          ${where_clause || "WHERE created_at >= NOW() - INTERVAL '12 months'"}
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY label`;
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
    return res.status(500).json({ 
      success: false, 
      message: "Error al obtener estadísticas" 
    });
  }
});

// Obtener opciones para filtros
router.get("/filter-options", async (req, res) => {
  try {
    const [
      universidades,
      facultades,
      carreras,
      becas,
      tiposMovilidad,
      ciclosEscolaresInicio,
      ciclosEscolaresFinal,
    ] = await Promise.all([
      query("SELECT id, nombre FROM universidades ORDER BY nombre"),
      query("SELECT id, nombre FROM facultades ORDER BY nombre"),
      query("SELECT id, nombre, facultad_id FROM carreras ORDER BY nombre"),
      query("SELECT id, nombre FROM becas ORDER BY nombre"),
      query("SELECT DISTINCT tipo_movilidad FROM users WHERE tipo_movilidad IS NOT NULL ORDER BY tipo_movilidad"),
      query("SELECT DISTINCT ciclo_escolar_inicio FROM users WHERE ciclo_escolar_inicio IS NOT NULL ORDER BY ciclo_escolar_inicio DESC"),
      query("SELECT DISTINCT ciclo_escolar_final FROM users WHERE ciclo_escolar_final IS NOT NULL ORDER BY ciclo_escolar_final DESC"),
    ]);

    const ciclosUnicos = new Set([
      ...ciclosEscolaresInicio.rows.map((r) => r.ciclo_escolar_inicio),
      ...ciclosEscolaresFinal.rows.map((r) => r.ciclo_escolar_final),
    ]);

    return res.json({
      success: true,
      data: {
        universidades: universidades.rows,
        facultades: facultades.rows,
        carreras: carreras.rows,
        becas: becas.rows,
        tiposMovilidad: tiposMovilidad.rows.map((r) => r.tipo_movilidad),
        ciclosEscolares: Array.from(ciclosUnicos).sort().reverse(),
      },
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error al obtener opciones de filtros" 
    });
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
    return res.status(500).json({ success: false, message: "Error al obtener páginas visitadas" });
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
    return res.status(500).json({ success: false, message: "Error al obtener visitas por período" });
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
    return res.status(500).json({ success: false, message: "Error al obtener visitas por hora" });
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
    return res.status(500).json({ success: false, message: "Error al obtener resumen de visitantes" });
  }
});

module.exports = router;

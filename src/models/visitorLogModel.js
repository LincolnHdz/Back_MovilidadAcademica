const { query } = require("../config/database");

const createVisitorLogTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS visitor_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      page_visited VARCHAR(255),
      action VARCHAR(100),
      session_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Tabla visitor_logs creada o ya existe");
  } catch (error) {
    console.error("Error al crear la tabla visitor_logs:", error);
    throw error;
  }
};

const logVisitor = async (logData) => {
  const { user_id, ip_address, user_agent, page_visited, action, session_id } =
    logData;

  try {
    const result = await query(
      `INSERT INTO visitor_logs 
      (user_id, ip_address, user_agent, page_visited, action, session_id) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [user_id, ip_address, user_agent, page_visited, action, session_id]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error al registrar visita:", error);
    throw error;
  }
};

const getVisitorStats = async (filters = {}) => {
  try {
    const clauses = [];
    const params = [];
    let idx = 1;

    // Construir condiciones WHERE
    if (filters.fecha_inicio) {
      clauses.push(`created_at >= $${idx++}`);
      params.push(filters.fecha_inicio);
    }
    if (filters.fecha_fin) {
      clauses.push(`created_at <= $${idx++}`);
      params.push(filters.fecha_fin);
    }
    if (filters.page_visited) {
      clauses.push(`page_visited = $${idx++}`);
      params.push(filters.page_visited);
    }
    if (filters.action) {
      clauses.push(`action = $${idx++}`);
      params.push(filters.action);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM visitor_logs 
      ${where}
    `;

    const statsResult = await query(statsQuery, params);

    // Páginas más visitadas
    const pagesQuery = `
      SELECT 
        page_visited as label,
        COUNT(*) as value
      FROM visitor_logs 
      ${where}
      GROUP BY page_visited
      ORDER BY value DESC
      LIMIT 10
    `;

    const pagesResult = await query(pagesQuery, params);

    // Acciones más comunes
    const actionsQuery = `
      SELECT 
        action as label,
        COUNT(*) as value
      FROM visitor_logs 
      ${where}
      WHERE action IS NOT NULL
      GROUP BY action
      ORDER BY value DESC
      LIMIT 10
    `;

    const actionsResult = await query(actionsQuery, params);

    // Visitas por día (últimos 30 días)
    const dailyQuery = `
      SELECT 
        DATE(created_at) as label,
        COUNT(*) as value
      FROM visitor_logs 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ${where.replace("created_at", "created_at")}
      GROUP BY DATE(created_at)
      ORDER BY label DESC
    `;

    const dailyResult = await query(dailyQuery, params);

    // Visitas por hora del día
    const hourlyQuery = `
      SELECT 
        EXTRACT(HOUR FROM created_at) as label,
        COUNT(*) as value
      FROM visitor_logs 
      ${where}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY label
    `;

    const hourlyResult = await query(hourlyQuery, params);

    return {
      general: statsResult.rows[0],
      pages: pagesResult.rows,
      actions: actionsResult.rows,
      daily: dailyResult.rows,
      hourly: hourlyResult.rows,
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas de visitantes:", error);
    throw error;
  }
};

const getVisitorLogs = async (filters = {}, limit = 100, offset = 0) => {
  try {
    const clauses = [];
    const params = [];
    let idx = 1;

    // Construir condiciones WHERE
    if (filters.fecha_inicio) {
      clauses.push(`vl.created_at >= $${idx++}`);
      params.push(filters.fecha_inicio);
    }
    if (filters.fecha_fin) {
      clauses.push(`vl.created_at <= $${idx++}`);
      params.push(filters.fecha_fin);
    }
    if (filters.user_id) {
      clauses.push(`vl.user_id = $${idx++}`);
      params.push(filters.user_id);
    }
    if (filters.page_visited) {
      clauses.push(`vl.page_visited = $${idx++}`);
      params.push(filters.page_visited);
    }
    if (filters.action) {
      clauses.push(`vl.action = $${idx++}`);
      params.push(filters.action);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

    const result = await query(
      `SELECT 
        vl.*,
        u.nombres,
        u.apellido_paterno,
        u.apellido_materno,
        u.email
      FROM visitor_logs vl
      LEFT JOIN users u ON vl.user_id = u.id
      ${where}
      ORDER BY vl.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return result.rows;
  } catch (error) {
    console.error("Error obteniendo logs de visitantes:", error);
    throw error;
  }
};

module.exports = {
  createVisitorLogTable,
  logVisitor,
  getVisitorStats,
  getVisitorLogs,
};

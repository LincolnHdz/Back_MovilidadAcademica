const express = require("express");
const { query } = require("../config/database");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  logVisitor,
  getVisitorStats,
  getVisitorLogs,
} = require("../models/visitorLogModel");

const router = express.Router();

// Middleware para registrar visitas (solo para rutas públicas)
const trackVisit = async (req, res, next) => {
  try {
    const logData = {
      user_id: req.user?.id || null,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent"),
      page_visited: req.originalUrl,
      action: req.method,
      session_id: req.sessionID || null,
    };

    // Registrar en background sin bloquear la respuesta
    setImmediate(async () => {
      try {
        await logVisitor(logData);
      } catch (error) {
        console.error("Error registrando visita:", error);
      }
    });

    next();
  } catch (error) {
    console.error("Error en middleware de tracking:", error);
    next(); // Continuar aunque falle el tracking
  }
};

// Endpoint para registrar visitas manualmente (desde el frontend)
router.post("/log", async (req, res) => {
  try {
    const { page_visited, action } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    let user_id = null;
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        user_id = decoded.id;
      } catch (e) {
        // Token inválido, continuar sin user_id
      }
    }

    const logData = {
      user_id,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent"),
      page_visited,
      action: action || "visit",
      session_id: req.sessionID || null,
    };

    await logVisitor(logData);

    res.json({ success: true, message: "Visita registrada" });
  } catch (error) {
    console.error("Error registrando visita:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

// Estadísticas de visitantes (solo administradores)
router.get(
  "/stats",
  authMiddleware,
  requireRole(["administrador"]),
  async (req, res) => {
    try {
      const filters = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        page_visited: req.query.page_visited,
        action: req.query.action,
      };

      const stats = await getVisitorStats(filters);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error obteniendo estadísticas de visitantes:", error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  }
);

// Logs detallados de visitantes (solo administradores)
router.get(
  "/logs",
  authMiddleware,
  requireRole(["administrador"]),
  async (req, res) => {
    try {
      const filters = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        user_id: req.query.user_id,
        page_visited: req.query.page_visited,
        action: req.query.action,
      };

      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      const logs = await getVisitorLogs(filters, limit, offset);
      res.json({ success: true, data: logs });
    } catch (error) {
      console.error("Error obteniendo logs de visitantes:", error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  }
);

// Páginas más visitadas
router.get(
  "/stats/pages",
  authMiddleware,
  requireRole(["administrador"]),
  async (req, res) => {
    try {
      const result = await query(
        `SELECT 
        page_visited as label,
        COUNT(*) as value
      FROM visitor_logs 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY page_visited
      ORDER BY value DESC
      LIMIT 20`
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error obteniendo páginas más visitadas:", error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  }
);

// Visitas por período
router.get(
  "/stats/period",
  authMiddleware,
  requireRole(["administrador"]),
  async (req, res) => {
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
        ${dateFormat} as label,
        COUNT(*) as value
      FROM visitor_logs 
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY ${dateFormat}
      ORDER BY label DESC`
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error("Error obteniendo visitas por período:", error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  }
);

module.exports = { router, trackVisit };

const sendPdfEmail = async (req, res) => {
  try {
    console.log(req.body, req.files);

    if (!req.files || !req.files.pdf) {
      return res.status(400).json({
        success: false,
        message: "No se ha proporcionado ningún archivo PDF"
      });
    }

    const { email, dataset, filters } = req.body;
    const pdfFile = req.files.pdf;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es requerido"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato del correo inválido"
      });
    }

    let contenido = `
      <h2>Gráficas Estadísticas</h2>
      <p>Adjunto encontrarás el PDF con las gráficas solicitadas.</p>
    `;

    if (dataset) {
      contenido += `<p><strong>Dataset:</strong> ${dataset}</p>`;
    }

    if (filters) {
      try {
        const parsed = JSON.parse(filters);
        const list = Object.entries(parsed)
          .filter(([_, v]) => v && v !== "")
          .map(([k, v]) => `<li>${k}: ${v}</li>`)
          .join("");

        if (list) contenido += `<p><strong>Filtros aplicados:</strong></p><ul>${list}</ul>`;
      } catch (e) {
        console.log("Error parseando filtros:", e);
      }
    }

    contenido += `<br><p><em>Este es un correo automático, por favor no responder.</em></p>`;

    const FormData = require("form-data");
    const formData = new FormData();

    formData.append("key_api", process.env.UASLP_API_KEY || "S3RT?8B4674#$33FG($35H45");
    formData.append("tipo_mensaje", "archivos");
    formData.append("destino", email);
    formData.append("asunto", "Gráficas Estadísticas - Sistema de Movilidad");
    formData.append("contenido", contenido);

    // EXACTO IGUAL AL QUE SÍ FUNCIONA
    formData.append("archivos_length", "1");
    formData.append("archivo0", pdfFile.data, {
      filename: pdfFile.name || "graficas.pdf",
      contentType: "application/pdf",
    });

    const axios = require("axios");
    const response = await axios.post(
      "https://servicios.ing.uaslp.mx/gtm/api_correos/sendMailWithAttachments.php",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000
      }
    );

    console.log("Respuesta del API de correos:", response.data);

    return res.json({
      success: true,
      api: response.data
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.response?.data || err.message
    });
  }
};

module.exports = {
  sendPdfEmail
};
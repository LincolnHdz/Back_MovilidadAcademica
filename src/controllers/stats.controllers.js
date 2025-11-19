const https = require("https");
const axios = require("axios");
const FormData = require("form-data");
const { PDFDocument } = require("pdf-lib");

/**
 * Comprime un PDF reduciendo su tamaño
 * Esta función no funciona bien con PDFs que ya tienen imágenes optimizadas
 * @param {Buffer} pdfBuffer - Buffer del PDF original
 * @returns {Promise<Buffer>} - Buffer del PDF comprimido
 */
const compressPdf = async (pdfBuffer) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    const compressedPdf = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
    
    const originalSize = pdfBuffer.length / 1024 / 1024;
    const compressedSize = compressedPdf.length / 1024 / 1024;
    const reduction = ((pdfBuffer.length - compressedPdf.length) / pdfBuffer.length) * 100;
    
    console.log(`PDF original: ${originalSize.toFixed(2)} MB`);
    console.log(`PDF comprimido: ${compressedSize.toFixed(2)} MB`);
    console.log(`Reducción: ${reduction.toFixed(1)}%`);
    
    // Solo usar comprimido si realmente es menor
    if (compressedPdf.length < pdfBuffer.length) {
      return Buffer.from(compressedPdf);
    }
    
    return pdfBuffer;
  } catch (error) {
    console.error("Error al comprimir PDF:", error);
    return pdfBuffer;
  }
};

const sendPdfEmail = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // VALIDACIÓN PDF
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({
        success: false,
        message: "No se ha proporcionado ningún archivo PDF",
      });
    }

    const { email, dataset, filters } = req.body;
    const pdfFile = req.files.pdf;

    // VALIDAR EMAIL
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es requerido",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Formato del correo inválido",
      });
    }

    // VERIFICAR PDF REAL
    console.log("PDF SIZE =", pdfFile.data.length);

    if (!pdfFile.data || pdfFile.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El PDF está vacío o corrupto",
      });
    }

    // *** COMPRIMIR PDF SI ES MUY GRANDE ***
    let pdfData = pdfFile.data;
    const maxSize = 1.8 * 1024 * 1024; // 1.8MB margen de seguridad
    
    if (pdfData.length > maxSize) {
      console.log("⚠️ PDF muy grande, intentando comprimir...");
      pdfData = await compressPdf(pdfData);
      
      if (pdfData.length > maxSize) {
        const sizeMB = (pdfData.length / 1024 / 1024).toFixed(2);
        console.error(`❌ PDF demasiado grande: ${sizeMB} MB`);
        
        return res.status(413).json({
          success: false,
          message: `El PDF es muy grande (${sizeMB} MB). El límite del servidor es aproximadamente 2MB.`,
        });
      }
    }
    
    console.log(`✓ PDF listo para envío: ${(pdfData.length / 1024 / 1024).toFixed(2)} MB`);

    // CONTENIDO DEL CORREO
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

    // ============================
    // FORM DATA - FORMATO EXACTO DEL API
    // ============================
    const formData = new FormData();

    formData.append("key_api", "S3RT?8B4674#$33FG($35H45");
    formData.append("tipo_mensaje", "archivos");
    formData.append("destino", email);
    formData.append("asunto", "Gráficas Estadísticas - Sistema de Movilidad");
    formData.append("contenido", contenido);
    formData.append("archivos_length", "1");
    formData.append("archivo0", pdfData, {
      filename: "graficas.pdf",
      contentType: "application/pdf",
      knownLength: pdfData.length
    });

    // NECESARIO PARA EVITAR ERRORES SSL
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    // ENVIAR REQUEST AL API UASLP
    const response = await axios.post(
      "https://servicios.ing.uaslp.mx/gtm/api_correos/sendMailWithAttachments.php",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: 50 * 1024 * 1024,
        maxContentLength: 50 * 1024 * 1024,
        httpsAgent,
        timeout: 60000,
        validateStatus: () => true,
        transformResponse: [(data) => data],
      }
    );

    console.log("Respuesta API correo, status:", response.data);

    // Verificar si el API respondió
    if (!response.data || String(response.data).trim() === '') {
      return res.status(500).json({
        success: false,
        message: "El servidor de correos no respondió correctamente",
      });
    }

    // Parsear respuesta
    let apiResponse = response.data;
    try {
      if (typeof response.data === 'string') {
        apiResponse = JSON.parse(response.data);
      }
    } catch (e) {
      console.log("Respuesta no JSON:", response.data);
    }

    // Verificar si el correo se procesó correctamente
    if (apiResponse?.correcto || apiResponse?.datos?.success) {
      return res.json({
        success: true,
        message: "Correo enviado exitosamente. El mensaje está en cola y será entregado en breve.",
        data: {
          threadId: apiResponse?.datos?.thread_id,
          estado: apiResponse?.datos?.estado || "En cola",
          destino: email
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: "El servidor procesó la solicitud pero no confirmó el envío",
      api: apiResponse,
    });

  } catch (err) {
    console.error("ERROR al enviar correo:", err.message);
    
    return res.status(500).json({
      success: false,
      message: err.response?.data || err.message || "Error al enviar el correo",
    });
  }
};

module.exports = { sendPdfEmail };
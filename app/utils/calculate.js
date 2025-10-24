import xml2js from "xml2js";

export function calculateValues(xmlContent) {
  const parser = new xml2js.Parser({ explicitArray: true });

  let totalValorPagoProc = 0;
  let valorPagoGuia = 0;
  let valoresProc = [];

  try {
    parser.parseString(xmlContent, (err, result) => {
      if (err) throw new Error("Erro ao processar o XML");

      const guia = result["ans:guiaMonitoramento"];
      if (!guia) {
        throw new Error("Estrutura XML inválida: guiaMonitoramento não encontrado");
      }

      const procedimentos = guia["ans:procedimentos"];
      const valoresGuia = guia["ans:valoresGuia"];

      if (!procedimentos || !valoresGuia) {
        throw new Error("Campos obrigatórios ausentes no XML");
      }

      valoresProc = procedimentos.map((proc) => {
        const valorPago = parseFloat(proc["ans:valorPagoProc"]?.[0] || "0");
        totalValorPagoProc += valorPago;
        return valorPago;
      });

      valorPagoGuia = parseFloat(valoresGuia[0]["ans:valorPagoGuia"]?.[0] || "0");
    });

    return {
      totalValorPagoProc: parseFloat(totalValorPagoProc.toFixed(2)),
      valorPagoGuia: parseFloat(valorPagoGuia.toFixed(2)),
      valoresProc: valoresProc.map((v) => parseFloat(v.toFixed(2))),
      areEqual: totalValorPagoProc.toFixed(2) === valorPagoGuia.toFixed(2),
    };
  } catch (error) {
    console.error("Erro ao processar XML:", error.message);
    return {
      totalValorPagoProc: 0,
      valorPagoGuia: 0,
      valoresProc: [],
      areEqual: false,
      error: error.message,
    };
  }
}

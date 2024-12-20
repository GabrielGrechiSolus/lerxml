import xml2js from 'xml2js';

export function calculateValues(xmlContent) {
    const parser = new xml2js.Parser({ explicitArray: true });
    let totalValorPagoProc = 0;
    let valorPagoGuia = 0;
    let valoresProc = [];

    parser.parseString(xmlContent, (err, result) => {
        if (err) throw new Error('Erro ao processar o XML');

        const procedimentos = result['ans:guiaMonitoramento']['ans:procedimentos'];
        valoresProc = procedimentos.map(proc => {
            const valorPagoProc = parseFloat(proc['ans:valorPagoProc'][0]);
            totalValorPagoProc += valorPagoProc;
            return valorPagoProc;
        });

        valorPagoGuia = parseFloat(result['ans:guiaMonitoramento']['ans:valoresGuia'][0]['ans:valorPagoGuia'][0]);
    });

    return {
        totalValorPagoProc: parseFloat(totalValorPagoProc.toFixed(2)),
        valorPagoGuia: parseFloat(valorPagoGuia.toFixed(2)),
        valoresProc: valoresProc.map(value => parseFloat(value.toFixed(2))),
        areEqual: totalValorPagoProc.toFixed(2) === valorPagoGuia.toFixed(2),
    };
}

const xml2js = require('xml2js');

export async function calculate(xmlData) {
    try {
        const result = await xml2js.parseStringPromise(xmlData);
        const procedimentos = result['ans:guiaMonitoramento']['ans:procedimentos'];

        let totalValorPagoProc = 0;

        procedimentos.forEach((procedimento) => {
            const valorPagoProc = parseFloat(procedimento['ans:valorPagoProc'][0] || '0');
            totalValorPagoProc += valorPagoProc;
        });

        const valoresGuia = result['ans:guiaMonitoramento']['ans:valoresGuia'][0];
        const valorPagoGuia = parseFloat(valoresGuia['ans:valorPagoGuia'][0] || '0');

        return {
            totalValorPagoProc: totalValorPagoProc.toFixed(2),
            valorPagoGuia: valorPagoGuia.toFixed(2),
            isEqual: totalValorPagoProc === valorPagoGuia,
        };
    } catch (error) {
        throw new Error('Erro ao processar o XML: ' + error.message);
    }
}

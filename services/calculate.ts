import xml2js from 'xml2js';

export type CalcResult = {
  totalValorPagoProc: number;
  valorPagoGuia: number;
  valoresProc: number[];
  areEqual: boolean;
  error?: string;
};

function parseNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value as number;
  if (typeof value === 'string') {
    const s = (value as string).trim();
    const hasDot = s.includes('.');
    const hasComma = s.includes(',');
    let normalized = s;

    if (hasDot && hasComma) {
      const lastDot = s.lastIndexOf('.');
      const lastComma = s.lastIndexOf(',');
      if (lastComma > lastDot) {
        // format like 1.234,56 -> dot as thousands, comma as decimal
        normalized = s.replace(/\./g, '').replace(',', '.');
      } else {
        // format like 1,234.56 -> comma thousands, dot decimal
        normalized = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      // format like 1234,56
      normalized = s.replace(/\./g, '').replace(',', '.');
    } else {
      // format like 1234.56 or 123456
      normalized = s;
    }

    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function findChildByName(obj: unknown, name: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  const record = obj as Record<string, unknown>;
  // direct match
  if (Object.prototype.hasOwnProperty.call(record, name)) return record[name];
  // match without namespace prefix
  const keys = Object.keys(record);
  for (const k of keys) {
    const short = k.split(':').pop();
    if (short === name) return record[k];
  }
  return undefined;
}

export async function calculateValues(xmlContent: string): Promise<CalcResult> {
  const parser = new xml2js.Parser({ explicitArray: false });

  try {
    const result: unknown = await parser.parseStringPromise(xmlContent);

    // Find guiaMonitoramento node (may have namespace prefix)
    const guia = findChildByName(result, 'guiaMonitoramento') || findChildByName(result, 'ans:guiaMonitoramento');
    if (!guia) {
      return {
        totalValorPagoProc: 0,
        valorPagoGuia: 0,
        valoresProc: [],
        areEqual: false,
        error: 'Estrutura XML inválida: guiaMonitoramento não encontrado',
      };
    }

    const procedimentos = findChildByName(guia, 'procedimentos') || findChildByName(guia, 'ans:procedimentos');
    const valoresGuia = findChildByName(guia, 'valoresGuia') || findChildByName(guia, 'ans:valoresGuia');

    if (!procedimentos || !valoresGuia) {
      return {
        totalValorPagoProc: 0,
        valorPagoGuia: 0,
        valoresProc: [],
        areEqual: false,
        error: 'Campos obrigatórios ausentes no XML',
      };
    }

    // procedimentos may be an object or array
    // normalize procedimentos into an array and handle namespaced keys
    let procsArray: unknown[] = [];
    if (Array.isArray(procedimentos)) {
      procsArray = procedimentos as unknown[];
    } else if (procedimentos && typeof procedimentos === 'object') {
      const rec = procedimentos as Record<string, unknown>;
      let found: unknown = undefined;
      for (const k of Object.keys(rec)) {
        if (k.split(':').pop() === 'procedimento') {
          found = rec[k];
          break;
        }
      }
      if (found !== undefined) {
        procsArray = Array.isArray(found) ? (found as unknown[]) : [found];
      } else {
        procsArray = [procedimentos] as unknown[];
      }
    } else {
      procsArray = [procedimentos] as unknown[];
    }

    const valoresProc: number[] = [];
    let totalValorPagoProc = 0;

    for (const proc of procsArray) {
      const valorPagoRaw = findChildByName(proc, 'valorPagoProc') || (proc && typeof proc === 'object' ? (proc as Record<string, unknown>)['ans:valorPagoProc'] : undefined) || 0;
      const valorPago = parseNumber(valorPagoRaw);
      valoresProc.push(parseFloat(valorPago.toFixed(2)));
      totalValorPagoProc += valorPago;
    }

    const valorPagoGuiaRaw = findChildByName(valoresGuia, 'valorPagoGuia') || (valoresGuia && typeof valoresGuia === 'object' ? (valoresGuia as Record<string, unknown>)['ans:valorPagoGuia'] : undefined) || 0;
    const valorPagoGuia = parseNumber(valorPagoGuiaRaw);

    const totalRounded = parseFloat(totalValorPagoProc.toFixed(2));
    const guiaRounded = parseFloat(valorPagoGuia.toFixed(2));

    return {
      totalValorPagoProc: totalRounded,
      valorPagoGuia: guiaRounded,
      valoresProc: valoresProc.map((v) => parseFloat(v.toFixed(2))),
      areEqual: totalRounded === guiaRounded,
    };
  } catch (err: unknown) {
    let message = 'Erro desconhecido';
    if (err instanceof Error) message = err.message;
    else message = String(err);
    return {
      totalValorPagoProc: 0,
      valorPagoGuia: 0,
      valoresProc: [],
      areEqual: false,
      error: message,
    };
  }
}

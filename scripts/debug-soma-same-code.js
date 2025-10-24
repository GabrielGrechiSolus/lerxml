const xml2js = require('xml2js');

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<ans:guiaMonitoramento xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <ans:valoresGuia>
    <ans:valorPagoGuia>2077.95</ans:valorPagoGuia>
  </ans:valoresGuia>
  <ans:procedimentos>
    <ans:identProcedimento>
      <ans:codigoTabela>63</ans:codigoTabela>
      <ans:Procedimento>
        <ans:grupoProcedimento>029</ans:grupoProcedimento>
      </ans:Procedimento>
    </ans:identProcedimento>
    <ans:quantidadeInformada>306.0000</ans:quantidadeInformada>
    <ans:valorInformado>2004.96</ans:valorInformado>
    <ans:quantidadePaga>306.0000</ans:quantidadePaga>
    <ans:valorPagoProc>2004.96</ans:valorPagoProc>
  </ans:procedimentos>
  <ans:procedimentos>
    <ans:identProcedimento>
      <ans:codigoTabela>00</ans:codigoTabela>
      <ans:Procedimento>
        <ans:codigoProcedimento>93674289</ans:codigoProcedimento>
      </ans:Procedimento>
    </ans:identProcedimento>
    <ans:quantidadeInformada>1.0000</ans:quantidadeInformada>
    <ans:valorInformado>72.99</ans:valorInformado>
    <ans:quantidadePaga>1.0000</ans:quantidadePaga>
    <ans:valorPagoProc>72.99</ans:valorPagoProc>
  </ans:procedimentos>
</ans:guiaMonitoramento>`;

const parser = new xml2js.Parser({ explicitArray: false });

function findValorTags(node, tags) {
  if (typeof node === 'string' || typeof node === 'number') return;
  if (Array.isArray(node)) {
    node.forEach(child => findValorTags(child, tags));
  } else if (typeof node === 'object' && node !== null) {
    Object.entries(node).forEach(([key, value]) => {
      if (key.toLowerCase().includes('valor')) tags.add(key);
      findValorTags(value, tags);
    });
  }
}

function somaTag(node, tag, callback) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string' || typeof node === 'number') return;
  if (Array.isArray(node)) {
    node.forEach(child => somaTag(child, tag, callback));
  } else if (typeof node === 'object') {
    Object.entries(node).forEach(([key, value]) => {
      if (key === tag) {
        if (typeof value === 'string') {
          const n = parseFloat(value.replace(',', '.'));
          if (!isNaN(n)) callback(n);
        } else if (typeof value === 'number') {
          callback(value);
        } else if (Array.isArray(value)) {
          value.forEach(v => somaTag(v, tag, callback));
        }
      } else {
        somaTag(value, tag, callback);
      }
    });
  }
}

parser.parseStringPromise(sampleXml).then((result) => {
  console.log('root', Object.keys(result));
  const tags = new Set();
  findValorTags(result, tags);
  console.log('found tags:', Array.from(tags));
  const tagToSum = Array.from(tags).find(t => t.toLowerCase().includes('valorpagoproc'));
  console.log('tagToSum:', tagToSum);
  let total = 0;
  somaTag(result, tagToSum, (v) => total += v);
  console.log('total by somaTag:', total);
}).catch(err => console.error(err));

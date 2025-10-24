'use client';

import React, { useState } from 'react';
import xml2js from 'xml2js';

export default function TotalizadoresXML() {
  const [totals, setTotals] = useState<{ [key: string]: number }>({});
  const [totalGeral, setTotalGeral] = useState<number>(0);
  const [xmlFile, setXmlFile] = useState<File | null>(null);

  // Seleciona arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setXmlFile(file);

    // limpa resultados anteriores
    setTotals({});
    setTotalGeral(0);
  };

  // Processa XML ao clicar no botão
  const handleProcessar = async () => {
    if (!xmlFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const xmlContent = event.target?.result as string;
      try {
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xmlContent);
        const totalsObj: { [key: string]: number } = {};
        sumValorTags(result, totalsObj);
        setTotals(totalsObj);

        const geral = Object.values(totalsObj).reduce((acc, val) => acc + val, 0);
        setTotalGeral(geral);
      } catch (err) {
        console.error('Erro ao processar XML:', err);
        alert('Erro ao processar XML. Verifique o arquivo.');
      }
    };
    reader.readAsText(xmlFile);
  };

  // Função recursiva para percorrer todas as tags e filtrar as que começam com "valor", incluindo namespaces
  const sumValorTags = (node: any, totalsObj: { [key: string]: number }) => {
    if (typeof node === 'object' && node !== null) {
      Object.entries(node).forEach(([key, value]) => {
        // Remove namespace (ex: ans:valorTotalDiarias → valorTotalDiarias)
        const keySemNamespace = key.includes(':') ? key.split(':')[1] : key;

        if (typeof value === 'object') {
          sumValorTags(value, totalsObj);
        } else if (!isNaN(parseFloat(value)) && keySemNamespace.toLowerCase().startsWith('valor')) {
          totalsObj[key] = (totalsObj[key] || 0) + parseFloat(value);
        }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-8 text-center">
        Totalizadores Dinâmicos de XML
      </h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="border-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 cursor-pointer transition-all duration-200"
        />

        <button
          onClick={handleProcessar}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          Processar XML
        </button>
      </div>

      {Object.keys(totals).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {Object.entries(totals).map(([tag, value]) => (
            <div
              key={tag}
              className="bg-gradient-to-tr from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200 border-t-4 border-blue-500"
            >
              <h3 className="text-blue-700 font-semibold text-lg break-words">{tag}</h3>
              <p className="text-gray-800 font-bold text-2xl mt-2">{value.toFixed(2)}</p>
            </div>
          ))}

          {/* Card total geral */}
          <div className="bg-gradient-to-tr from-green-50 to-green-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200 border-t-4 border-green-500">
            <h3 className="text-green-700 font-semibold text-lg">Total Geral</h3>
            <p className="text-gray-800 font-bold text-2xl mt-2">{totalGeral.toFixed(2)}</p>
          </div>
        </div>
      )}

      {Object.keys(totals).length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          📁 Selecione um arquivo XML e clique em "Processar XML" para calcular totalizadores (tags iniciando com "valor").
        </p>
      )}
    </div>
  );
}

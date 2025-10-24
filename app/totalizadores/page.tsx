'use client';

import React, { useState } from 'react';
import { Parser } from 'xml2js';

type XMLNode = { [key: string]: string | XMLNode | XMLNode[] };

export default function TotalizadoresXML() {
  const [xmlData, setXmlData] = useState<XMLNode | null>(null);
  const [totals, setTotals] = useState<{ [tag: string]: number }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setXmlData(null);
    setTotals({});

    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const parser = new Parser({ explicitArray: false });
      try {
        const result: XMLNode = await parser.parseStringPromise(content);
        setXmlData(result);
        const totalsObj: { [tag: string]: number } = {};
        sumValorTags(result, totalsObj);
        setTotals(totalsObj);
      } catch (err) {
        console.error('Erro ao processar XML:', err);
      }
    };
    reader.readAsText(file);
  };

  // Função recursiva para somar todas as tags que começam com "valor"
  const sumValorTags = (node: XMLNode | string | XMLNode[], totalsObj: { [tag: string]: number }) => {
    if (typeof node === 'string') return;
    if (Array.isArray(node)) {
      node.forEach((child) => sumValorTags(child, totalsObj));
    } else if (typeof node === 'object') {
      Object.entries(node).forEach(([key, value]) => {
        const keySemNamespace = key.split(':').pop() || key;
        if (typeof value === 'object') {
          sumValorTags(value, totalsObj);
        } else if (typeof value === 'string' && !isNaN(parseFloat(value)) && keySemNamespace.toLowerCase().startsWith('valor')) {
          totalsObj[key] = (totalsObj[key] || 0) + parseFloat(value);
        }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10">
      <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
        Totalizadores 🧮
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 justify-center">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="border-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 cursor-pointer transition-all duration-200"
        />
      </div>

      {Object.keys(totals).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {Object.entries(totals).map(([tag, total]) => (
            <div
              key={tag}
              className="bg-green-50 p-4 rounded-xl shadow-md border-t-4 border-green-500 text-center"
            >
              <h3 className="text-gray-500 text-sm font-medium break-words">{tag}</h3>
              <p className="text-2xl font-bold text-green-700 mt-2">{total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {!xmlData && (
        <p className="text-gray-500 text-center mt-10 text-lg">
          📁 Selecione um arquivo XML para visualizar os totalizadores das tags que começam com &quot;valor&quot;.
        </p>
      )}
    </div>
  );
}

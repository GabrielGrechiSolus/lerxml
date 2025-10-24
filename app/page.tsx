'use client';

import React, { useState } from 'react';
import { calculateValues } from './utils/calculate';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<{
    totalValorPagoProc: number;
    valorPagoGuia: number;
    valoresProc: number[];
    areEqual: boolean;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleProcessFile = async () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlContent = event.target?.result as string;
      const calculatedResults = calculateValues(xmlContent);
      setResults(calculatedResults);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-8 text-center">
        Processador de Arquivos XML
      </h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="border-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 cursor-pointer transition-all duration-200"
        />
        <button
          onClick={handleProcessFile}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 transition-all duration-200 w-full sm:w-auto"
        >
          Processar Arquivo
        </button>
      </div>

      {results && (
        <div className="w-full bg-gray-50 p-8 rounded-2xl shadow-inner border border-gray-200">
          <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center">
            Resultados do Cálculo
          </h2>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow-md rounded-xl p-4 text-center border-t-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-medium">Total valorPagoProc</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {results.totalValorPagoProc.toFixed(2)}
              </p>
            </div>

            <div className="bg-white shadow-md rounded-xl p-4 text-center border-t-4 border-indigo-500">
              <h3 className="text-gray-500 text-sm font-medium">Valor Pago Guia</h3>
              <p className="text-2xl font-bold text-indigo-600 mt-2">
                {results.valorPagoGuia.toFixed(2)}
              </p>
            </div>

            <div
              className={`bg-white shadow-md rounded-xl p-4 text-center border-t-4 ${
                results.areEqual ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <h3 className="text-gray-500 text-sm font-medium">Comparativo</h3>
              <p
                className={`text-2xl font-bold mt-2 ${
                  results.areEqual ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {results.areEqual ? 'Iguais' : 'Diferentes'}
              </p>
            </div>
          </div>

          {/* Tabela */}
          <h3 className="text-xl font-semibold text-blue-600 mb-4 text-center">
            Detalhamento dos Procedimentos
          </h3>
          <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full text-sm text-center">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <tr>
                  <th className="px-4 py-3">Procedimento</th>
                  <th className="px-4 py-3">Valor Pago (R$)</th>
                </tr>
              </thead>
              <tbody>
                {results.valoresProc.map((value, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      Procedimento {index + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {value.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

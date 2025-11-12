"use client";

import React, { useState, useRef } from 'react';
import { calculateValues } from '../services/calculate';
import FileDropArea from '../components/FileDropArea';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorBanner from '../components/ErrorBanner';
import { formatBytes, mimeOrDefault } from './utils/formatFile';
import { FiUpload, FiPlay } from 'react-icons/fi';

export default function ProcessarXML() {
  const [file, setFile] = useState<File | null>(null);
  type ResultType = {
    totalValorPagoProc: number;
    valorPagoGuia: number;
    valoresProc: number[];
    areEqual: boolean;
  };
  const [results, setResults] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFile(selectedFile as File);
  };

  const processXmlContent = async (xmlContent: string) => {
    setLoading(true);
    setResults(null);
    setErrorMessage(null);
    try {
      const calculatedResults = await calculateValues(xmlContent);
      if (calculatedResults.error) {
        setErrorMessage(calculatedResults.error);
        setResults(null);
      } else {
        setResults(calculatedResults);
      }
    } catch (err) {
      setErrorMessage((err as Error)?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      setErrorMessage('Nenhum arquivo selecionado');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const xmlContent = event.target?.result as string;
      await processXmlContent(xmlContent);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-8 text-center">Valor pago proc - Erro 5042-059</h1>

      <FileDropArea onFile={handleFile} accept=".xml">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-2 justify-center">
          <div className="w-full sm:w-auto text-left flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <p className="text-gray-600">Arraste e solte um arquivo XML aqui ou</p>
            </div>
            <div className="flex items-center gap-3">
              <input ref={inputRef} type="file" accept=".xml" onChange={handleFileChange} className="hidden" />
              <button
                onClick={() => inputRef.current?.click()}
                className="btn-ghost btn-sm"
                title="Escolher arquivo"
              >
                <FiUpload size={18} />
                <span>Escolher</span>
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={handleProcessFile}
              disabled={loading}
              className="btn-primary"
              style={{ minWidth: 160 }}
            >
              <FiPlay size={18} />
              <span>{loading ? 'Processando...' : 'Processar Arquivo'}</span>
            </button>
          </div>
        </div>
        {file && (
          <div className="text-sm text-gray-700 mt-2">
            <div>Arquivo: <span className="font-medium">{file.name}</span></div>
            <div>Tamanho: <span className="font-medium">{formatBytes(file.size)}</span> — Tipo: <span className="font-medium">{mimeOrDefault(file)}</span></div>
          </div>
        )}
      </FileDropArea>

      <div className="mt-6">
        {loading && <LoadingSkeleton />}
        {errorMessage && <ErrorBanner message={errorMessage} />}

        {results && (
          <div className="bg-gray-50 p-8 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center">Resultados do Cálculo</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow-md rounded-xl p-4 text-center border-t-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-medium">Total valorPagoProc</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">{results.totalValorPagoProc.toFixed(2)}</p>
              </div>
              <div className="bg-white shadow-md rounded-xl p-4 text-center border-t-4 border-indigo-500">
                <h3 className="text-gray-500 text-sm font-medium">Valor Pago Guia</h3>
                <p className="text-2xl font-bold text-indigo-600 mt-2">{results.valorPagoGuia.toFixed(2)}</p>
              </div>
              <div className={`bg-white shadow-md rounded-xl p-4 text-center border-t-4 ${results.areEqual ? 'border-green-500' : 'border-red-500'}`}>
                <h3 className="text-gray-500 text-sm font-medium">Comparativo</h3>
                <p className={`text-2xl font-bold mt-2 ${results.areEqual ? 'text-green-600' : 'text-red-600'}`}>{results.areEqual ? 'Iguais' : 'Diferentes'}</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-blue-600 mb-4 text-center">Detalhamento dos Procedimentos</h3>

            <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
              <table className="min-w-full text-sm text-center">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                  <tr>
                    <th className="px-4 py-3">Procedimento</th>
                    <th className="px-4 py-3">Valor Pago (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.valoresProc.map((value: number, index: number) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-700">Procedimento {index + 1}</td>
                      <td className="px-4 py-3 text-gray-800">{value.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

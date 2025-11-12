"use client";

import React, { useState, useRef } from 'react';
import { Parser } from 'xml2js';
import FileDropArea from '../../components/FileDropArea';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorBanner from '../../components/ErrorBanner';
import { formatBytes, mimeOrDefault } from '../utils/formatFile';
import { FiUpload, FiFolder, FiDollarSign, FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import { parseNumber, stripNamespace } from '../utils/num';

type XMLNode = { [key: string]: any };

type TotalizadoresResult = {
  totalInformado: number;
  somaProcedimentos: number;
  diferenca: number;
  areEqual: boolean;
  procedimentos: number[];
};

export default function TotalizadoresPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<TotalizadoresResult | null>(null);

  const handleFile = (fileParam: File | null) => {
    setFile(fileParam);
    setResult(null);
    setErrorMessage(null);
    if (!fileParam) return;
    processFile(fileParam);
  };

  const processFile = (fileToProcess: File) => {
    setLoading(true);
    setErrorMessage(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const xmlContent = event.target?.result as string;
      try {
        const parser = new Parser({ explicitArray: false, tagNameProcessors: [stripNamespace] });
        const parsedXml: XMLNode = await parser.parseStringPromise(xmlContent);
        
        const guiaMonitoramento = parsedXml.guiaMonitoramento;
        if (!guiaMonitoramento) {
          throw new Error("Tag <ans:guiaMonitoramento> não encontrada no XML.");
        }

        const valoresGuia = guiaMonitoramento.valoresGuia;
        const totalInformado = parseNumber(valoresGuia?.valorTotalInformado || '0');

        let procedimentos = guiaMonitoramento.procedimentos;
        if (!procedimentos) {
          procedimentos = [];
        } else if (!Array.isArray(procedimentos)) {
          procedimentos = [procedimentos];
        }

        const valoresProcedimentos: number[] = [];
        let somaProcedimentos = 0;
        
        procedimentos.forEach((proc: XMLNode) => {
          const valor = parseNumber(proc.valorInformado || '0');
          valoresProcedimentos.push(valor);
          somaProcedimentos += valor;
        });

        const totalInformadoFixed = parseFloat(totalInformado.toFixed(2));
        const somaProcedimentosFixed = parseFloat(somaProcedimentos.toFixed(2));
        const diferenca = totalInformadoFixed - somaProcedimentosFixed;

        setResult({
          totalInformado: totalInformadoFixed,
          somaProcedimentos: somaProcedimentosFixed,
          diferenca: parseFloat(diferenca.toFixed(2)),
          areEqual: totalInformadoFixed === somaProcedimentosFixed,
          procedimentos: valoresProcedimentos,
        });

      } catch (err) {
        console.error('Erro ao processar XML:', err);
        const message = err instanceof Error ? err.message : 'Verifique o arquivo e tente novamente.';
        setErrorMessage(`Erro ao processar XML: ${message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(fileToProcess);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-3">
        <FiDollarSign size={28} className="text-accent" />
        <span>Total Informado - Erro 5042-50</span>
      </h1>

      <FileDropArea onFile={(f) => handleFile(f)} accept=".xml">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-2 justify-center">
          <div className="w-full sm:w-auto text-left">
            <p className="text-gray-600">Arraste um XML de guia de monitoramento aqui ou</p>
            <input ref={inputRef} type="file" accept=".xml" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" />
            <div className="flex items-center gap-3">
              <button onClick={() => inputRef.current?.click()} className="btn-ghost btn-sm">
                <FiUpload size={18} /> <span>Escolher Arquivo</span>
              </button>
              {file && (
                <div className="text-sm text-gray-700 mt-2">
                  <div>Arquivo: <span className="font-medium">{file.name}</span></div>
                  <div>Tamanho: <span className="font-medium">{formatBytes(file.size)}</span> — Tipo: <span className="font-medium">{mimeOrDefault(file)}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
        {loading && <LoadingSkeleton />}
        {errorMessage && <ErrorBanner message={errorMessage} />}
      </FileDropArea>

      {result ? (
        <div className="bg-gradient-to-tr from-blue-50 to-blue-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-200 border-t-4 border-blue-500 mt-6">
          <h3 className="text-blue-700 font-semibold text-xl sm:text-2xl text-center">Resultado da Conferência</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 font-semibold text-lg">Total Informado na Guia</p>
              <p className="text-gray-800 font-bold text-3xl mt-2">R$ {result.totalInformado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 font-semibold text-lg">Soma dos Procedimentos</p>
              <p className="text-gray-800 font-bold text-3xl mt-2">R$ {result.somaProcedimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className={`mt-8 p-5 rounded-lg text-white font-bold text-xl flex items-center justify-center gap-3 ${result.areEqual ? 'bg-green-500' : 'bg-red-500'}`}>
            {result.areEqual ? (
              <><FiCheckCircle size={24} /> Os valores CONFEREM!</>
            ) : (
              <><FiXCircle size={24} /> Os valores estão DIFERENTES!</>
            )}
          </div>

          {!result.areEqual && (
            <div className="mt-6 p-5 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 text-center">
              <p className="font-bold text-xl">Diferença encontrada: R$ {result.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          )}

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-2 text-center">Valores dos Procedimentos Encontrados ({result.procedimentos.length} itens)</h4>
            <div className="max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg border">
              <ul className="list-disc list-inside text-gray-600">
                {result.procedimentos.map((valor, index) => (
                  <li key={index} className="text-sm">
                    Item {index + 1}: R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      ) : (
        !loading && <p className="text-gray-500 text-center mt-10 text-lg flex items-center justify-center gap-2"><FiFolder className="text-accent" /> Selecione um arquivo XML para iniciar a conferência.</p>
      )}
    </div>
  );
}
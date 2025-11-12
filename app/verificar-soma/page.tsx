"use client";

import React, { useState, useRef } from 'react';
import { Parser } from 'xml2js';
import FileDropArea from '../../components/FileDropArea';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorBanner from '../../components/ErrorBanner';
import { formatBytes, mimeOrDefault } from '../utils/formatFile';
import { FiUpload, FiFolder, FiDollarSign, FiCheckCircle, FiXCircle, FiTrendingDown } from 'react-icons/fi';
import { parseNumber, stripNamespace } from '../utils/num';

type XMLNode = { [key: string]: string | number | XMLNode | XMLNode[] };

type AnsResult = {
  totalInformado: number;
  somaItens: number;
  diferenca: number;
};

export default function VerificarSomaPage() {
  const [xmlData, setXmlData] = useState<XMLNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [ansResult, setAnsResult] = useState<AnsResult | null>(null);

  const handleFile = (fileParam: File | null) => {
    setFile(fileParam);
    setXmlData(null);
    setAnsResult(null);
    setErrorMessage(null);
    if (!fileParam) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const xmlContent = event.target?.result as string;
      try {
        const parser = new Parser({ explicitArray: false });
        const result: XMLNode = await parser.parseStringPromise(xmlContent);
        setXmlData(result);
        handleAnsCalculation(result); // Process immediately after parsing
      } catch (err) {
        console.error('Erro ao processar XML:', err);
        setErrorMessage('Erro ao processar XML. Verifique o formato do arquivo.');
        setLoading(false);
      }
    };
    reader.readAsText(fileParam);
  };

  const handleAnsCalculation = (data: XMLNode) => {
    if (!data) {
      setErrorMessage('Arquivo XML não carregado.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setAnsResult(null);

    try {
      const totalInformadoValues: number[] = [];
      somaTag(data, 'ans:valorTotalInformado', (val) => {
        totalInformadoValues.push(val);
      });
      // Assuming only one total value per file/guide group
      const totalInformado = totalInformadoValues.length > 0 ? totalInformadoValues[0] : 0;

      let somaItens = 0;
      somaTag(data, 'ans:valorInformado', (val) => {
        if (!isNaN(val)) somaItens += val;
      });

      const diferenca = parseFloat(totalInformado.toFixed(2)) - parseFloat(somaItens.toFixed(2));

      setAnsResult({
        totalInformado,
        somaItens,
        diferenca,
      });
    } catch (err) {
      console.error('Erro ao processar XML para ANS:', err);
      setErrorMessage('Erro ao calcular valores do XML. Verifique as tags e a estrutura do arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const somaTag = (
    node: XMLNode | string | number | XMLNode[],
    tag: string,
    callback: (val: number) => void
  ) => {
    if (node === null || node === undefined) return;
    if (typeof node === 'string' || typeof node === 'number') return;

    if (Array.isArray(node)) {
      node.forEach((child) => somaTag(child, tag, callback));
    } else {
      Object.entries(node).forEach(([key, value]) => {
        const keyStripped = stripNamespace(key as string);
        const tagStripped = stripNamespace(tag);

        if (key === tag || keyStripped === tagStripped) {
          if (typeof value === 'string' || typeof value === 'number') {
            const n = parseNumber(value);
            if (!isNaN(n)) callback(n);
          } else if (Array.isArray(value)) {
            value.forEach((v) => {
              if (typeof v === 'string' || typeof v === 'number') {
                const n = parseNumber(v);
                if (!isNaN(n)) callback(n);
              }
            });
          }
        } else {
          somaTag(value, tag, callback);
        }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-3">
        <FiCheckCircle size={28} className="text-accent" />
        <span>Verificar Soma de Lote ANS</span>
      </h1>

      <FileDropArea onFile={handleFile} accept=".xml">
        <div className="flex flex-col items-center gap-4 mb-2 justify-center">
          <div className="w-full text-left">
            <p className="text-gray-600">Arraste um XML aqui ou</p>
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

      {!ansResult && !loading && (
        <p className="text-gray-500 text-center mt-10 text-lg flex items-center justify-center gap-2">
          <FiFolder className="text-accent" /> 
          Selecione um arquivo XML para verificar a soma dos valores.
        </p>
      )}

      {ansResult && !loading && (
        <div className="mt-8 bg-gradient-to-tr from-blue-50 to-blue-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-200 border-t-4 border-blue-500">
          <h3 className="text-blue-700 font-semibold text-xl sm:text-2xl text-center">Resultado da Verificação</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 font-semibold text-lg">Total Informado</p>
              <p className="text-gray-800 font-bold text-3xl mt-2">{ansResult.totalInformado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 font-semibold text-lg">Soma dos Itens</p>
              <p className="text-gray-800 font-bold text-3xl mt-2">{ansResult.somaItens.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 font-semibold text-lg">Diferença</p>
              <p className={`font-bold text-3xl mt-2 ${ansResult.diferenca !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                {ansResult.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className={`mt-8 p-4 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 ${ansResult.diferenca === 0 ? 'bg-green-500' : 'bg-red-500'}`}>
            {ansResult.diferenca === 0
              ? <><FiCheckCircle /> Os valores batem!</>
              : <><FiXCircle /> Os valores são diferentes!</>}
          </div>
        </div>
      )}
    </div>
  );
}

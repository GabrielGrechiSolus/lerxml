"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Parser } from 'xml2js';
import FileDropArea from '../../components/FileDropArea';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorBanner from '../../components/ErrorBanner';
import { formatBytes, mimeOrDefault } from '../utils/formatFile';
import { FiUpload, FiFolder, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { parseNumber, stripNamespace } from '../utils/num';

type XMLNode = { [key: string]: string | number | XMLNode | XMLNode[] };

type AnsResult = {
  totalInformado: number;
  somaItens: number;
  areEqual: boolean;
};

export default function SomaIndividualXML() {
  const [xmlData, setXmlData] = useState<XMLNode | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [calculationMode, setCalculationMode] = useState<'generic' | 'ans'>('generic');
  const [ansResult, setAnsResult] = useState<AnsResult | null>(null);

  useEffect(() => {
    setTotal(null);
    setAnsResult(null);
    setErrorMessage(null);
  }, [calculationMode]);

  const handleFile = (fileParam: File | null) => {
    setFile(fileParam);
    setXmlData(null);
    setAvailableTags([]);
    setSelectedTag('');
    setTotal(null);
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

        const tags = new Set<string>();
        findValorTags(result, tags);
        setAvailableTags(Array.from(tags));
      } catch (err) {
        console.error('Erro ao processar XML:', err);
        setErrorMessage('Erro ao processar XML. Verifique o arquivo.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(fileParam);
  };

  const findValorTags = (node: XMLNode | string | number | XMLNode[], tags: Set<string>) => {
    if (typeof node === 'string' || typeof node === 'number') return;
    if (Array.isArray(node)) {
      node.forEach((child) => findValorTags(child, tags));
    } else {
      Object.entries(node).forEach(([key, value]) => {
        if (key.toLowerCase().includes('valor')) tags.add(key);
        findValorTags(value, tags);
      });
    }
  };

  const handleSomar = () => {
    if (calculationMode === 'generic') {
      handleSomarTag();
    } else {
      handleAnsCalculation();
    }
  };

  const handleSomarTag = () => {
    if (!xmlData) {
      setErrorMessage('Selecione um arquivo XML primeiro.');
      return;
    }
    if (!selectedTag) {
      setErrorMessage('Selecione uma tag para somar.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setTotal(null);
    setAnsResult(null);

    try {
      let soma = 0;
      somaTag(xmlData, selectedTag, (val) => {
        if (!isNaN(val)) soma += val;
      });
      setTotal(soma);
    } catch (err) {
      console.error('Erro ao somar tag:', err);
      setErrorMessage('Erro ao somar tag. Verifique o arquivo e a tag selecionada.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnsCalculation = () => {
    if (!xmlData) {
      setErrorMessage('Selecione um arquivo XML primeiro.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setTotal(null);
    setAnsResult(null);

    try {
      const totalInformadoValues: number[] = [];
      somaTag(xmlData, 'ans:valorTotalInformado', (val) => {
        totalInformadoValues.push(val);
      });
      const totalInformado = totalInformadoValues.length > 0 ? totalInformadoValues[0] : 0;

      let somaItens = 0;
      somaTag(xmlData, 'ans:valorInformado', (val) => {
        if (!isNaN(val)) somaItens += val;
      });

      setAnsResult({
        totalInformado,
        somaItens,
        areEqual: parseFloat(totalInformado.toFixed(2)) === parseFloat(somaItens.toFixed(2)),
      });
    } catch (err) {
      console.error('Erro ao processar XML para ANS:', err);
      setErrorMessage('Erro ao processar XML para ANS. Verifique o arquivo.');
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
              } else {
                somaTag(v, tag, callback);
              }
            });
          } else if (typeof value === 'object' && value !== null) {
            Object.values(value).forEach((v) => {
              if (typeof v === 'string' || typeof v === 'number') {
                const n = parseNumber(v);
                if (!isNaN(n)) callback(n);
              } else {
                somaTag(v as unknown as XMLNode, tag, callback);
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
        <FiDollarSign size={28} className="text-accent" />
        <span>Soma de Valores em XML</span>
      </h1>

      <FileDropArea onFile={(f) => handleFile(f)} accept=".xml">
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

          <div className="my-4 flex justify-center gap-4 border-t pt-4 w-full">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="calculationMode"
                value="generic"
                checked={calculationMode === 'generic'}
                onChange={() => setCalculationMode('generic')}
                className="radio radio-primary"
              />
              <span className="label-text">Soma de Tag Individual</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="calculationMode"
                value="ans"
                checked={calculationMode === 'ans'}
                onChange={() => setCalculationMode('ans')}
                className="radio radio-primary"
              />
              <span className="label-text">Soma de Lote ANS</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-2 justify-center w-full">
            {calculationMode === 'generic' && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
              >
                <option value="">Selecione a tag...</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleSomar}
              disabled={!xmlData || loading}
              className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:from-green-700 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculando...' : (calculationMode === 'generic' ? 'Somar Tag' : 'Calcular Lote ANS')}
            </button>
          </div>
        </div>
        {loading && <LoadingSkeleton />}
        {errorMessage && <ErrorBanner message={errorMessage} />}
      </FileDropArea>

      {total === null && ansResult === null && !loading && (
        <p className="text-gray-500 text-center mt-10 text-lg flex items-center justify-center gap-2">
          <FiFolder className="text-accent" /> 
          {calculationMode === 'generic' 
            ? 'Selecione um XML, escolha a tag e clique em "Somar Tag".'
            : 'Selecione um XML e clique em "Calcular Lote ANS".'
          }
        </p>
      )}

      {total !== null && calculationMode === 'generic' && (
        <div className="bg-gradient-to-tr from-green-50 to-green-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-200 border-t-4 border-green-500 text-center">
          <h3 className="text-green-700 font-semibold text-xl sm:text-2xl break-words">Total da Tag <span className="text-blue-600">{selectedTag}</span></h3>
          <p className="text-gray-800 font-bold text-3xl sm:text-4xl mt-4">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      )}

      {ansResult !== null && calculationMode === 'ans' && (
        <div className="bg-gradient-to-tr from-blue-50 to-blue-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-200 border-t-4 border-blue-500 text-center">
          <h3 className="text-blue-700 font-semibold text-xl sm:text-2xl">Resultado da Soma de Lote ANS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 font-semibold">Total Informado no Lote (ans:valorTotalInformado)</p>
              <p className="text-gray-800 font-bold text-2xl">{ansResult.totalInformado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 font-semibold">Soma dos Itens (ans:valorInformado)</p>
              <p className="text-gray-800 font-bold text-2xl">{ansResult.somaItens.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className={`mt-6 p-4 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 ${ansResult.areEqual ? 'bg-green-500' : 'bg-red-500'}`}>
            {ansResult.areEqual
              ? <><FiCheckCircle /> Os valores são iguais!</>
              : <><FiXCircle /> Os valores são diferentes!</>}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useRef } from 'react';
import { Parser } from 'xml2js';
import { FiList, FiFolder } from 'react-icons/fi';
import FileDropArea from '../../components/FileDropArea';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorBanner from '../../components/ErrorBanner';
import { formatBytes, mimeOrDefault } from '../utils/formatFile';
import { FiUpload } from 'react-icons/fi';
import { parseNumber, stripNamespace } from '../utils/num';

type XMLNode = { [key: string]: string | XMLNode | XMLNode[] };

export default function TotalizadoresXML() {
  const [xmlData, setXmlData] = useState<XMLNode | null>(null);
  const [totals, setTotals] = useState<{ [tag: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (fileParam: File | null) => {
    setFile(fileParam);
    setXmlData(null);
    setTotals({});
    setErrorMessage(null);
    if (!fileParam) return;
    setLoading(true);
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
        setErrorMessage('Erro ao processar XML. Verifique o arquivo.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(fileParam);
  };

  // Função recursiva para somar todas as tags que começam com "valor"

  const sumValorTags = (node: XMLNode | string | XMLNode[], totalsObj: { [tag: string]: number }) => {
    if (typeof node === 'string' || typeof node === 'number') return;
    if (Array.isArray(node)) {
      node.forEach((child) => sumValorTags(child, totalsObj));
    } else if (typeof node === 'object' && node !== null) {
      Object.entries(node).forEach(([key, value]) => {
        const keySemNamespace = stripNamespace(key as string).toLowerCase();
        if (keySemNamespace.startsWith('valor')) {
          const n = parseNumber(value as unknown);
          totalsObj[key] = (totalsObj[key] || 0) + n;
        }
        // recurse into children
        sumValorTags(value as unknown as XMLNode, totalsObj);
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-3">
        <FiList size={28} className="text-accent" />
        <span>Totalizadores</span>
      </h1>

      <FileDropArea onFile={(f) => handleFile(f)} accept=".xml">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-2 justify-center">
          <div className="w-full sm:w-auto text-left">
            <p className="text-gray-600">Arraste um XML aqui ou</p>
            <input ref={inputRef} type="file" accept=".xml" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" />
            <div className="flex items-center gap-3">
              <button onClick={() => inputRef.current?.click()} className="btn-ghost btn-sm">
                <FiUpload size={18} /> <span>Escolher</span>
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
      </FileDropArea>

      {loading && <LoadingSkeleton />}

      {errorMessage && <ErrorBanner message={errorMessage} />}

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
        <p className="text-gray-500 text-center mt-10 text-lg flex items-center justify-center gap-2">
          <FiFolder className="text-accent" /> Selecione um arquivo XML para visualizar os totalizadores das tags que começam com &quot;valor&quot;.
        </p>
      )}
    </div>
  );
}

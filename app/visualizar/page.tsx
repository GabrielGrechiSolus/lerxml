"use client";

import React, { useState, useRef } from 'react';
import { Parser } from 'xml2js';
import FileDropArea from '../../components/FileDropArea';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorBanner from '../../components/ErrorBanner';
import { formatBytes, mimeOrDefault } from '../utils/formatFile';
import { FiUpload } from 'react-icons/fi';
import { FiFolder } from 'react-icons/fi';

type XMLNode = { [key: string]: string | XMLNode | XMLNode[] };

interface OpenMap {
  [key: string]: boolean;
}

// Função recursiva para determinar se um nó ou qualquer filho bate com o filtro
function nodeMatchesFilter(node: XMLNode | string, search: string): boolean {
  if (!search) return true;
  if (typeof node === 'string') {
    return node.toLowerCase().includes(search.toLowerCase());
  }
  if (typeof node === 'object') {
    return Object.entries(node).some(
      ([key, value]) =>
        key.toLowerCase().includes(search.toLowerCase()) ||
        nodeMatchesFilter(value as XMLNode | string, search)
    );
  }
  return false;
}

export default function VisualizarXML() {
  const [xmlData, setXmlData] = useState<XMLNode | null>(null);
  const [search, setSearch] = useState('');
  const [openMap, setOpenMap] = useState<OpenMap>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (fileParam: File | null) => {
    setFile(fileParam);
    setXmlData(null);
    setSearch('');
    setOpenMap({});
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
      } catch (err) {
        console.error('Erro ao processar XML:', err);
        setErrorMessage('Erro ao processar XML. Verifique o arquivo.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(fileParam);
  };

  const toggleOpen = (key: string) => setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  const isOpen = (key: string) => !!openMap[key];

  const renderNode = (node: XMLNode | string, parentKey = '', level = 0): React.ReactNode => {
    if (!nodeMatchesFilter(node, search)) return null;

    if (typeof node === 'string') {
      return (
        <div style={{ paddingLeft: level * 24 }} className="text-gray-800 mb-1">
          {node}
        </div>
      );
    }

    if (typeof node === 'object') {
      return (
        <ul className="list-none">
          {Object.entries(node).map(([key, value]) => {
            const uniqueKey = parentKey + key;
            const isValueTag = key.toLowerCase().startsWith('valor');
            if (!nodeMatchesFilter(value as XMLNode | string, search) && !key.toLowerCase().includes(search.toLowerCase())) {
              return null;
            }

            return (
              <li key={uniqueKey} className="mb-1">
                <div
                  className={`flex items-center gap-2 cursor-pointer select-none ${
                    isValueTag ? 'bg-green-50 rounded-lg px-2 py-1 hover:bg-green-100 transition' : ''
                  }`}
                  style={{ paddingLeft: level * 24 }}
                  onClick={() => typeof value === 'object' && toggleOpen(uniqueKey)}
                >
                  <span className="font-bold text-blue-600">
                    {typeof value === 'object' ? (isOpen(uniqueKey) ? '▼' : '►') : '•'} {key}
                  </span>
                  {typeof value === 'string' && (
                    <span className={isValueTag ? 'ml-2 font-bold text-green-700' : 'ml-2 text-gray-700'}>
                      {value}
                    </span>
                  )}
                </div>
                {typeof value === 'object' && isOpen(uniqueKey) && renderNode(value as XMLNode, uniqueKey, level + 1)}
              </li>
            );
          })}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10">
      <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
        Visualizar XML 🔍
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

          <input
            type="text"
            placeholder="Filtrar tags ou valores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
        </div>
      </FileDropArea>

      <div className="mt-6">
        {loading && <LoadingSkeleton />}
        {errorMessage && <ErrorBanner message={errorMessage} />}
        {xmlData ? (
          <div className="overflow-x-auto rounded-2xl shadow-inner border border-gray-200 p-6 bg-gray-50">
            {renderNode(xmlData)}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-10 text-lg flex items-center justify-center gap-2"><FiFolder className="text-accent" /> Selecione um arquivo XML para visualizar dinamicamente seu conteúdo.</p>
        )}
      </div>
    </div>
  );
}

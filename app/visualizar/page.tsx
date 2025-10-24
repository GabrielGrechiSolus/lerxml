'use client';

import React, { useState } from 'react';
import xml2js from 'xml2js';

interface OpenMap {
  [key: string]: boolean;
}

// Função recursiva para determinar se um nó ou qualquer filho bate com o filtro
function nodeMatchesFilter(node: any, search: string): boolean {
  if (!search) return true;
  if (typeof node === 'string') {
    return node.toLowerCase().includes(search.toLowerCase());
  }
  if (typeof node === 'object') {
    return Object.entries(node).some(
      ([key, value]) =>
        key.toLowerCase().includes(search.toLowerCase()) ||
        nodeMatchesFilter(value, search)
    );
  }
  return false;
}

export default function VisualizarXML() {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [xmlData, setXmlData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [openMap, setOpenMap] = useState<OpenMap>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setXmlFile(file);
    setXmlData(null);
    setSearch('');
    setOpenMap({});

    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const parser = new xml2js.Parser({ explicitArray: false });
        try {
          const result = await parser.parseStringPromise(content);
          setXmlData(result);
        } catch (err) {
          console.error('Erro ao processar XML:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleOpen = (key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isOpen = (key: string) => !!openMap[key];

  const renderNode = (node: any, parentKey = '', level = 0): JSX.Element | null => {
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
            if (!nodeMatchesFilter(value, search) && !key.toLowerCase().includes(search.toLowerCase())) {
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

                {typeof value === 'object' && isOpen(uniqueKey) && renderNode(value, uniqueKey, level + 1)}
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

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 justify-center">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="border-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 cursor-pointer transition-all duration-200"
        />

        <input
          type="text"
          placeholder="Filtrar tags ou valores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
        />
      </div>

      {xmlData ? (
        <div className="overflow-x-auto rounded-2xl shadow-inner border border-gray-200 p-6 bg-gray-50">
          {renderNode(xmlData)}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10 text-lg">
          📁 Selecione um arquivo XML para visualizar dinamicamente seu conteúdo.
        </p>
      )}
    </div>
  );
}

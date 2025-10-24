'use client';

import React, { useState } from 'react';
import xml2js from 'xml2js';

export default function VisualizarXML() {
  const [xmlObject, setXmlObject] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlContent = event.target?.result as string;
      const parser = new xml2js.Parser({ explicitArray: false });
      parser.parseString(xmlContent, (err, result) => {
        if (!err) setXmlObject(result);
      });
    };
    reader.readAsText(file);
  };

  const filterNode = (node: any, term: string) => {
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node).toLowerCase().includes(term.toLowerCase()) ? node : null;
    }

    const filteredEntries: any = {};
    Object.keys(node).forEach((key) => {
      const child = filterNode(node[key], term);
      if (child) filteredEntries[key] = child;
    });

    return Object.keys(filteredEntries).length > 0 ? filteredEntries : null;
  };

  const renderNode = (node: any) => {
    if (typeof node !== 'object')
      return <span className="text-gray-800">{String(node)}</span>;

    return Object.keys(node).map((key, index) => (
      <details key={index} className="ml-4 border-l border-gray-300 pl-3 my-1 rounded-md">
        <summary className="cursor-pointer text-blue-600 font-semibold hover:text-blue-800">
          {key}
        </summary>
        <div className="ml-2 text-gray-800">
          {typeof node[key] === 'object' ? renderNode(node[key]) : <p>{node[key]}</p>}
        </div>
      </details>
    ));
  };

  const displayedXml = searchTerm && xmlObject ? filterNode(xmlObject, searchTerm) : xmlObject;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-8 text-center">
        Visualizador de XML
      </h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="border-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 cursor-pointer transition-all duration-200"
        />
      </div>

      {xmlObject && (
        <input
          type="text"
          placeholder="🔍 Pesquisar no XML..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      )}

      {displayedXml ? (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 overflow-y-auto max-h-[70vh] shadow-inner">
          <div className="text-sm">{renderNode(displayedXml)}</div>
        </div>
      ) : xmlObject ? (
        <p className="text-gray-500 text-center mt-10">
          ⚠️ Nenhum resultado encontrado para "{searchTerm}".
        </p>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          📁 Selecione um arquivo XML para visualizar seu conteúdo.
        </p>
      )}
    </div>
  );
}

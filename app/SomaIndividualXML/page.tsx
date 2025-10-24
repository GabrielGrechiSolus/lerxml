'use client';

import React, { useState } from 'react';
import xml2js from 'xml2js';

export default function SomaIndividualXML() {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [total, setTotal] = useState<number | null>(null);

  // Seleciona arquivo XML
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setXmlFile(file);
    setTotal(null);
    setAvailableTags([]);
    setSelectedTag('');

    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const xmlContent = event.target?.result as string;
        try {
          const parser = new xml2js.Parser({ explicitArray: false });
          const result = await parser.parseStringPromise(xmlContent);

          const tags = new Set<string>();
          findValorTags(result, tags);

          setAvailableTags(Array.from(tags));
        } catch (err) {
          console.error('Erro ao processar XML:', err);
          alert('Erro ao processar XML. Verifique o arquivo.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Função recursiva para encontrar todas as tags que começam com "valor"
  const findValorTags = (node: any, tags: Set<string>) => {
    if (typeof node === 'object' && node !== null) {
      Object.entries(node).forEach(([key, value]) => {
        if (key.startsWith('valor') || key.includes(':valor')) {
          tags.add(key);
        }
        if (typeof value === 'object') {
          findValorTags(value, tags);
        }
      });
    }
  };

  // Soma os valores da tag selecionada
  const handleSomarTag = () => {
    if (!xmlFile) {
      alert('Selecione um arquivo XML primeiro.');
      return;
    }
    if (!selectedTag) {
      alert('Selecione uma tag para somar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const xmlContent = event.target?.result as string;
      try {
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xmlContent);

        let soma = 0;
        somaTag(result, selectedTag, (val) => {
          if (!isNaN(val)) soma += parseFloat(val);
        });

        setTotal(soma);
      } catch (err) {
        console.error('Erro ao processar XML:', err);
        alert('Erro ao processar XML. Verifique o arquivo.');
      }
    };
    reader.readAsText(xmlFile);
  };

  // Função recursiva para somar tags específicas
  const somaTag = (node: any, tag: string, callback: (val: number) => void) => {
    if (typeof node === 'object' && node !== null) {
      Object.entries(node).forEach(([key, value]) => {
        if (key === tag) {
          if (Array.isArray(value)) {
            value.forEach((v) => callback(parseFloat(v)));
          } else {
            callback(parseFloat(value));
          }
        } else if (typeof value === 'object') {
          somaTag(value, tag, callback);
        }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-8 text-center">
        Soma Individual de Tag
      </h1>

      {/* Upload e seleção de tag */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 justify-center">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          className="border-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 cursor-pointer transition-all duration-200"
        />

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

        <button
          onClick={handleSomarTag}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          Somar Tag
        </button>
      </div>

      {/* Resultado */}
      {total !== null && (
        <div className="bg-gradient-to-tr from-green-50 to-green-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-200 border-t-4 border-green-500 text-center">
          <h3 className="text-green-700 font-semibold text-xl sm:text-2xl break-words">
            Total da Tag <span className="text-blue-600">{selectedTag}</span>
          </h3>
          <p className="text-gray-800 font-bold text-3xl sm:text-4xl mt-4">{total.toFixed(2)}</p>
        </div>
      )}

      {total === null && (
        <p className="text-gray-500 text-center mt-10 text-lg">
          📁 Selecione um XML e escolha a tag que deseja somar, depois clique em "Somar Tag".
        </p>
      )}
    </div>
  );
}

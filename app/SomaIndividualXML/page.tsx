"use client";

import React, { useState, useRef } from 'react';
import { Parser } from 'xml2js';
import FileDropArea from '../../components/FileDropArea';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorBanner from '../../components/ErrorBanner';
import { formatBytes, mimeOrDefault } from '../utils/formatFile';
import { FiUpload, FiFolder } from 'react-icons/fi';
import { parseNumber, stripNamespace } from '../utils/num';

type XMLNode = { [key: string]: string | number | XMLNode | XMLNode[] };

import { FiDollarSign } from 'react-icons/fi';

export default function SomaIndividualXML() {
  const [xmlData, setXmlData] = useState<XMLNode | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (fileParam: File | null) => {
    setFile(fileParam);
    setXmlData(null);
    setAvailableTags([]);
    setSelectedTag('');
    setTotal(null);
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

  const handleSomarTag = () => {
    if (!xmlData) {
      setErrorMessage('Selecione um arquivo XML primeiro.');
      return;
    }
    if (!selectedTag) {
      setErrorMessage('Selecione uma tag para somar.');
      return;
    }

    let soma = 0;
    somaTag(xmlData, selectedTag, (val) => {
      if (!isNaN(val)) soma += val;
    });
    setTotal(soma);
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
          // value can be string, number, array or nested object
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
            // try to find a nested textual value
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
        <span>Soma Individual de Tag</span>
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
            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:from-green-700 hover:to-green-600 transition-all duration-200"
          >
            Somar Tag
          </button>
        </div>
        {loading && <LoadingSkeleton />}
        {errorMessage && <ErrorBanner message={errorMessage} />}
      </FileDropArea>

      {total !== null ? (
        <div className="bg-gradient-to-tr from-green-50 to-green-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-200 border-t-4 border-green-500 text-center">
          <h3 className="text-green-700 font-semibold text-xl sm:text-2xl break-words">Total da Tag <span className="text-blue-600">{selectedTag}</span></h3>
          <p className="text-gray-800 font-bold text-3xl sm:text-4xl mt-4">{total.toFixed(2)}</p>
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10 text-lg flex items-center justify-center gap-2"><FiFolder className="text-accent" /> Selecione um XML e escolha a tag que deseja somar, depois clique em &quot;Somar Tag&quot;.</p>
      )}
    </div>
  );
}

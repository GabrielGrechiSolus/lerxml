'use client';

import React, { useState } from 'react';
import { calculateValues } from './utils/calculate';

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<{
        totalValorPagoProc: number;
        valorPagoGuia: number;
        valoresProc: number[];
        areEqual: boolean;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleProcessFile = async () => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const xmlContent = event.target?.result as string;
            const calculatedResults = calculateValues(xmlContent);
            setResults(calculatedResults);
        };
        reader.readAsText(file);
    };

    return (
        <div className="container">
            <h1 className="title">Bem-vindo ao Processador de Arquivos</h1>
            <div className="upload-section">
                <input type="file" accept=".xml" onChange={handleFileChange} />
                <button onClick={handleProcessFile} className="process-btn">Processar Arquivo</button>
            </div>
            {results && (
                <div className="results">
                    <h2>Resultados do Cálculo</h2>
                    <p><strong>Total de valorPagoProc:</strong> {results.totalValorPagoProc.toFixed(2)}</p>
                    <p><strong>Valor Pago Guia:</strong> {results.valorPagoGuia.toFixed(2)}</p>
                    <p>
                        Os valores são: <strong>{results.areEqual ? 'Iguais' : 'Diferentes'}</strong>
                    </p>
                    <h3>Lista de Valores Calculados:</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Procedimento</th>
                                    <th>Valor Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.valoresProc.map((value, index) => (
                                    <tr key={index}>
                                        <td>Procedimento {index + 1}</td>
                                        <td>{value.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <style jsx>{`
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start; /* Não centraliza tudo, usa o topo da tela */
                    min-height: 100vh;
                    background: white;
                    color: black;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    overflow: hidden;
                }

                .title {
                    color: #007bff;
                    margin-bottom: 20px;
                    font-size: 2rem;
                    text-align: center;
                }

                .upload-section {
                    margin-bottom: 20px;
                    text-align: center;
                    width: 100%;
                    max-width: 500px;  /* Limita a largura para dispositivos maiores */
                    margin-bottom: 30px;
                }

                input[type='file'] {
                    margin-right: 10px;
                    padding: 8px;
                    border-radius: 5px;
                    border: 1px solid #ddd;
                    font-size: 1rem;
                    width: calc(100% - 110px);  /* Ajusta o campo de input para usar a largura disponível */
                }

                .process-btn {
                    background-color: #007bff;
                    color: white;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 1rem;
                    margin-top: 20px;
                    width: 100%;  /* Faz o botão ocupar toda a largura disponível */
                }

                .process-btn:hover {
                    background-color: #0056b3;
                }

                .results {
                    margin-top: 30px;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    background: #f9f9f9;
                    width: 100%;
                    max-width: 1000px; /* Aumenta a largura máxima da seção de resultados */
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    overflow-x: auto;
                }

                .results h2 {
                    color: #007bff;
                    margin-bottom: 10px;
                    text-align: center;
                }

                .table-container {
                    max-width: 100%;
                    overflow-x: auto;
                    margin-top: 20px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    padding: 12px;
                    text-align: center;
                    border: 1px solid #ddd;
                }

                th {
                    background-color: #007bff;
                    color: white;
                }

                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }

                tr:hover {
                    background-color: #e0f7fa;
                }

                .results p {
                    font-size: 1.2rem;
                    text-align: center;
                }

                .results h3 {
                    font-size: 1.5rem;
                    color: #007bff;
                    margin-top: 20px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}

"use client"
import { useState } from "react";
import { calculate } from "./utils/calculate";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<null | {
        totalValorPagoProc: string;
        valorPagoGuia: string;
        isEqual: boolean;
    }>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Selecione um arquivo antes de enviar.");
            return;
        }

        try {
            const fileContent = await file.text();
            const result = await calculate(fileContent);
            setResult(result);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Upload de XML</h1>
                <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileChange}
                    className="block w-full px-3 py-2 mb-4 text-sm text-gray-700 border border-gray-300 rounded-md"
                />
                <button
                    onClick={handleUpload}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition"
                >
                    Processar Arquivo
                </button>
                {error && (
                    <div className="mt-4 text-red-500 text-sm">{error}</div>
                )}
                {result && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-sm">
                            <strong>Total de Valor Pago Proc:</strong> {result.totalValorPagoProc}
                        </p>
                        <p className="text-sm">
                            <strong>Valor Pago Guia:</strong> {result.valorPagoGuia}
                        </p>
                        <p className="text-sm">
                            <strong>Resultado:</strong>{" "}
                            {result.isEqual
                                ? "Os valores são iguais"
                                : "Os valores são diferentes"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

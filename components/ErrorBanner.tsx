import React from 'react';

type Props = {
  message: string;
};

export default function ErrorBanner({ message }: Props) {
  return (
    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
      <strong className="font-semibold">Erro: </strong>
      <span>{message}</span>
    </div>
  );
}

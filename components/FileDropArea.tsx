"use client";

import React from 'react';

type Props = {
  onFile: (file: File) => void;
  accept?: string;
  children?: React.ReactNode;
};

export default function FileDropArea({ onFile, accept = '.xml', children }: Props) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const f = files[0];
      if (!accept || f.name.endsWith(accept)) onFile(f);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full p-6 rounded-lg border-2 border-dashed border-blue-200 bg-gradient-to-r from-white to-blue-50 text-center"
    >
      {children}
    </div>
  );
}

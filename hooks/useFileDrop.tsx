import { useCallback, useState } from 'react';

export function useFileDrop() {
  const [dragActive, setDragActive] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent, accept?: string, cb?: (file: File) => void) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const f = files[0];
      if (!accept || f.name.endsWith(accept)) cb?.(f);
    }
  }, []);

  return { dragActive, onDragOver, onDragLeave, onDrop };
}

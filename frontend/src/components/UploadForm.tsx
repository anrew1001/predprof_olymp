import { useState, useRef, useCallback } from 'react';
import { uploadTest } from '../api/client';
import type { TestResult } from '../types/api';
import axios from 'axios';

interface Props {
  onResult: (result: TestResult) => void;
}

export default function UploadForm({ onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.npz')) {
      setError('Принимаются только файлы .npz');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await uploadTest(file);
      setResult(res);
      onResult(res);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Ошибка обработки файла');
      } else {
        setError('Ошибка соединения');
      }
    } finally {
      setLoading(false);
    }
  };

  const accuracy = result ? (result.accuracy * 100).toFixed(2) : null;
  const accuracyColor = result
    ? result.accuracy >= 0.8 ? 'var(--success)' : result.accuracy >= 0.5 ? '#d97706' : 'var(--error)'
    : 'var(--blue)';

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
        Загрузка тестового набора
      </h2>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            flex: 1,
            background: dragOver ? 'var(--blue-light)' : 'var(--bg-surface)',
            border: `2px dashed ${dragOver ? 'var(--blue)' : file ? 'var(--success)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '22px', flexShrink: 0 }}>
            {file ? '✅' : '📂'}
          </span>
          <div>
            <p style={{
              fontSize: '14px',
              color: file ? 'var(--success)' : 'var(--text-secondary)',
              margin: 0,
            }}>
              {file ? file.name : 'Перетащите .npz файл или нажмите'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Только .npz файлы'}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".npz"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {/* Submit */}
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!file || loading}
          style={{ flexShrink: 0, alignSelf: 'stretch', minWidth: '110px', whiteSpace: 'nowrap' }}
        >
          {loading ? <><span className="spinner" />Анализ...</> : 'Запустить'}
        </button>
      </div>

      {error && (
        <div style={{
          marginTop: '10px',
          background: 'var(--error-light)',
          border: '1px solid var(--error-border)',
          borderRadius: 'var(--radius)',
          padding: '9px 12px',
          fontSize: '13px',
          color: 'var(--error)',
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          marginTop: '14px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr 1fr 1fr',
          gap: '16px',
          alignItems: 'center',
        }}>
          {/* Big accuracy */}
          <div style={{ paddingRight: '16px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: accuracyColor, lineHeight: 1 }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Accuracy</div>
          </div>

          {[
            { label: 'Loss', value: result.loss !== null ? result.loss.toFixed(4) : '—' },
            { label: 'Сэмплов', value: result.total_samples },
            { label: 'Верных', value: result.correct_samples },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

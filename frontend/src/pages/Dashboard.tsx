import { useState } from 'react';
import Navbar from '../components/Navbar';
import UploadForm from '../components/UploadForm';
import TrainingHistoryChart from '../components/charts/TrainingHistoryChart';
import ClassDistributionChart from '../components/charts/ClassDistributionChart';
import PerSampleChart from '../components/charts/PerSampleChart';
import Top5ValidationChart from '../components/charts/Top5ValidationChart';
import type { SampleResult, TestResult } from '../types/api';

export default function Dashboard() {
  const [perSample, setPerSample] = useState<SampleResult[] | null>(null);

  const handleUploadResult = (result: TestResult) => {
    setPerSample(result.per_sample);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-surface)' }}>
      <Navbar />

      <main style={{ padding: '28px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Аналитика
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Классификатор инопланетных радиосигналов
          </p>
        </div>

        {/* Upload section */}
        <div className="animate-fade-up-delay-1" style={{ marginBottom: '20px' }}>
          <UploadForm onResult={handleUploadResult} />
        </div>

        {/* Status bar */}
        <div className="animate-fade-up-delay-2" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '8px 12px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: '13px',
          color: 'var(--text-muted)',
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: perSample ? 'var(--success)' : 'var(--text-muted)',
            flexShrink: 0,
          }} />
          {perSample ? `Тест загружен · ${perSample.length} сэмплов` : 'Загрузите .npz файл для анализа'}
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
            Прокрутка — зум · Drag — перемещение
          </span>
        </div>

        {/* Charts grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          <div className="animate-fade-up-delay-2" style={{ minHeight: '300px' }}>
            <TrainingHistoryChart />
          </div>
          <div className="animate-fade-up-delay-2" style={{ minHeight: '300px' }}>
            <ClassDistributionChart />
          </div>
          <div className="animate-fade-up-delay-3" style={{ minHeight: '300px' }}>
            <PerSampleChart samples={perSample} />
          </div>
          <div className="animate-fade-up-delay-3" style={{ minHeight: '300px' }}>
            <Top5ValidationChart />
          </div>
        </div>
      </main>
    </div>
  );
}

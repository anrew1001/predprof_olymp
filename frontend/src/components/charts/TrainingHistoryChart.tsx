import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';
import { getTrainingHistory } from '../../api/client';
import type { TrainingHistory } from '../../types/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, zoomPlugin
);

// Shared chart defaults for light background
export const CHART_GRID_COLOR = 'rgba(0,0,0,0.06)';
export const CHART_BORDER_COLOR = 'rgba(0,0,0,0.1)';
export const CHART_TICK_COLOR = '#9ca3af';
export const CHART_FONT = 'system-ui';

export const CHART_TOOLTIP = {
  backgroundColor: '#1f2937',
  borderColor: '#374151',
  borderWidth: 1,
  titleColor: '#f9fafb',
  bodyColor: '#d1d5db',
  padding: 10,
  bodyFont: { family: 'ui-monospace, Menlo, monospace', size: 12 },
  titleFont: { family: 'ui-monospace, Menlo, monospace', size: 12 },
};

export const CHART_ZOOM = {
  zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' as const },
  pan: { enabled: true, mode: 'x' as const },
};

export default function TrainingHistoryChart() {
  const [history, setHistory] = useState<TrainingHistory | null>(null);
  const [error, setError] = useState(false);
  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    getTrainingHistory()
      .then(setHistory)
      .catch(() => setError(true));
  }, []);

  const resetZoom = () => chartRef.current?.resetZoom();

  if (error || !history) {
    return (
      <ChartPlaceholder
        title="Точность по эпохам"
        subtitle="val_accuracy + accuracy vs epochs"
        isEmpty={error}
      />
    );
  }

  const epochs = history.accuracy.map((_, i) => `${i + 1}`);

  const data = {
    labels: epochs,
    datasets: [
      {
        label: 'Train accuracy',
        data: history.accuracy,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.06)',
        borderWidth: 2,
        pointRadius: epochs.length > 50 ? 0 : 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Val accuracy',
        data: history.val_accuracy,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.06)',
        borderWidth: 2,
        pointRadius: epochs.length > 50 ? 0 : 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <ChartWrapper title="Точность по эпохам" subtitle="val_accuracy + accuracy vs epochs" onReset={resetZoom}>
      <Line
        ref={chartRef}
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          scales: {
            x: {
              ticks: { color: CHART_TICK_COLOR, font: { family: CHART_FONT, size: 11 }, maxTicksLimit: 10 },
              grid: { color: CHART_GRID_COLOR },
              border: { color: CHART_BORDER_COLOR },
            },
            y: {
              min: 0, max: 1,
              ticks: { color: CHART_TICK_COLOR, font: { family: CHART_FONT, size: 11 } },
              grid: { color: CHART_GRID_COLOR },
              border: { color: CHART_BORDER_COLOR },
            },
          },
          plugins: {
            legend: {
              labels: { color: '#374151', font: { family: CHART_FONT, size: 12 }, boxWidth: 12, padding: 16 },
            },
            tooltip: CHART_TOOLTIP,
            zoom: CHART_ZOOM,
          },
        }}
      />
    </ChartWrapper>
  );
}

export function ChartWrapper({
  title, subtitle, onReset, children,
}: {
  title: string; subtitle: string; onReset?: () => void; children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {title}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>
        </div>
        {onReset && (
          <button onClick={onReset} className="btn-ghost" style={{ padding: '4px 10px', fontSize: '12px' }}>
            Сброс
          </button>
        )}
      </div>
      <div style={{ flex: 1, minHeight: '220px' }}>
        {children}
      </div>
    </div>
  );
}

export function ChartPlaceholder({
  title, subtitle, isEmpty,
}: {
  title: string; subtitle: string; isEmpty: boolean;
}) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: `2px dashed var(--border)`,
      borderRadius: 'var(--radius)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '280px',
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{subtitle}</p>
      <div style={{
        padding: '8px 14px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        fontSize: '13px',
        color: 'var(--text-muted)',
      }}>
        {isEmpty ? 'Нет данных (запустите обучение модели)' : 'Загрузка...'}
      </div>
    </div>
  );
}

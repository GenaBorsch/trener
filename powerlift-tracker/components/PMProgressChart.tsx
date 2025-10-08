'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PMHistoryEntry {
  date: string;
  squat: number | null;
  bench: number | null;
  deadlift: number | null;
}

interface PMProgressChartProps {
  pmHistory: PMHistoryEntry[];
}

export default function PMProgressChart({ pmHistory }: PMProgressChartProps) {
  if (!pmHistory || pmHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет данных для отображения графика
      </div>
    );
  }

  // Сортируем историю по дате
  const sortedHistory = [...pmHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Подготавливаем данные для графика
  const labels = sortedHistory.map(entry => 
    new Date(entry.date).toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Присед',
        data: sortedHistory.map(entry => entry.squat),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Жим',
        data: sortedHistory.map(entry => entry.bench),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Тяга',
        data: sortedHistory.map(entry => entry.deadlift),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Прогресс личных максимумов (PM)',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' кг';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Вес (кг)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Дата',
        },
      },
    },
  };

  return (
    <div className="h-96">
      <Line data={data} options={options} />
    </div>
  );
}






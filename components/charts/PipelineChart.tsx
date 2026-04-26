'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { STAGE_CONFIG, formatCurrency } from '@/lib/utils';
import type { DealStageSummary } from '@/lib/types';

interface Props {
  data: DealStageSummary[];
}

export function PipelineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 10, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(s) => STAGE_CONFIG[s as keyof typeof STAGE_CONFIG]?.label ?? s}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
          labelFormatter={(s) => STAGE_CONFIG[s as keyof typeof STAGE_CONFIG]?.label ?? s}
          formatter={(v) => [formatCurrency(Number(v)), 'Total Value']}
        />
        <Bar dataKey="total_value" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.stage}
              fill={STAGE_CONFIG[entry.stage]?.color ?? '#6366f1'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

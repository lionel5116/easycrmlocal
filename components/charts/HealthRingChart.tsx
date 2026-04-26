'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { HEALTH_CONFIG } from '@/lib/utils';
import type { HealthStatus } from '@/lib/types';

const COLORS: Record<HealthStatus, string> = {
  healthy: '#10b981',
  at_risk: '#f59e0b',
  critical: '#f43f5e',
};

interface Props {
  data: { health: HealthStatus; count: number }[];
}

export function HealthRingChart({ data }: Props) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="health"
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.health} fill={COLORS[entry.health]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
            formatter={(v, n) => [v, HEALTH_CONFIG[n as HealthStatus]?.label ?? n]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2">
        {data.map(({ health, count }) => (
          <div key={health} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[health] }} />
            <span className="text-gray-400 w-16">{HEALTH_CONFIG[health].label}</span>
            <span className="font-medium text-white">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { STAGE_CONFIG, cn } from '@/lib/utils';
import type { DealStage } from '@/lib/types';

export function StageBadge({ stage, className }: { stage: DealStage; className?: string }) {
  const { label, color } = STAGE_CONFIG[stage];
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

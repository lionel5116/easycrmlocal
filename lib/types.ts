// ─── Enums ────────────────────────────────────────────────────────────────────
export type HealthStatus = 'healthy' | 'at_risk' | 'critical';
export type DealStage =
  | 'prospecting'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';
export type ContactRole = 'executive' | 'manager' | 'associate' | 'stakeholder';
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';

// ─── Entities ─────────────────────────────────────────────────────────────────
export interface Contact {
  id: string;
  company_id: string | null;
  company_name: string | null;
  industry: string | null;
  company_size: 'small' | 'mid' | 'enterprise' | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  role: ContactRole;
  region: string | null;
  health: HealthStatus;
  last_activity_at: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  company_id: string | null;
  company_name: string | null;
  contact_id: string | null;
  contact_name: string | null;
  title: string;
  stage: DealStage;
  value: number;
  close_date: string | null;
  probability: number;
  region: string | null;
  owner: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  contact_id: string;
  deal_id: string | null;
  type: ActivityType;
  subject: string;
  body: string | null;
  occurred_at: string;
  created_by: string | null;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  region: string | null;
  size: 'small' | 'mid' | 'enterprise' | null;
}

export interface ContactInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  role: ContactRole;
  region: string | null;
  health: HealthStatus;
  company_id: string | null;
}

export interface DealInput {
  title: string;
  stage: DealStage;
  value: number;
  close_date: string | null;
  probability: number;
  region: string | null;
  owner: string | null;
  company_id: string | null;
  contact_id: string | null;
}

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  filters: FilterParams;
  created_by: string | null;
  is_shared: boolean;
  created_at: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardData {
  contacts: {
    total: number;
    healthy: number;
    at_risk: number;
    critical: number;
  };
  deals: {
    total_deals: number;
    total_pipeline: number;
    won_value: number;
    weighted_pipeline: number;
    avg_deal_size: number;
  };
  health_breakdown: { health: HealthStatus; count: number }[];
  activity_trend: { date: string; count: number; type: ActivityType }[];
  region_breakdown: { region: string; deal_count: number; total_value: number }[];
}

export interface DealStageSummary {
  stage: DealStage;
  count: number;
  total_value: number;
  avg_probability: number;
  weighted_value: number;
}

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface FilterParams {
  search?: string;
  region?: string[];
  health?: HealthStatus[];
  stage?: DealStage[];
  size?: string[];
  industry?: string[];
  role?: ContactRole[];
  dateRange?: string;
  dateFrom?: string;
  dateTo?: string;
  minValue?: number;
  maxValue?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type ViewMode = 'table' | 'chart' | 'timeline';
export type UserRole = 'executive' | 'manager' | 'associate';

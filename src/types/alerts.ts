
export interface AlertPreference {
  id: string;
  user_id: string;
  profit_margin_threshold: number;
  min_stock: number;
  include_retailers: string[];
  alert_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertPreferenceCreate {
  user_id: string;
  profit_margin_threshold?: number;
  min_stock?: number;
  include_retailers?: string[];
  alert_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  is_active?: boolean;
}

export interface AlertPreferenceUpdate {
  profit_margin_threshold?: number;
  min_stock?: number;
  include_retailers?: string[];
  alert_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  is_active?: boolean;
}

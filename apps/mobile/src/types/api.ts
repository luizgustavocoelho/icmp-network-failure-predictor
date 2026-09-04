export type NetworkStatus =
  | "OK"
  | "RISK"
  | "FAILURE";


export type Host = {
  id: number;
  name: string;
  ip_address: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


export type Measurement = {
  id: number;
  host_id: number;
  measured_at: string;
  latency_ms: number | null;
  packet_loss_pct: number;
  success: boolean;
  status: NetworkStatus;
  created_at: string;
};


export type Prediction = {
  id: number;
  host_id: number;
  generated_at: string;
  forecast_for: string;
  predicted_latency_ms: number | null;
  predicted_packet_loss_pct: number | null;
  predicted_status: NetworkStatus;
  confidence: number | null;
};


export type AlertSeverity =
  | "info"
  | "warning"
  | "critical";


export type NetworkAlert = {
  id: number;
  host_id: number;
  measurement_id: number | null;
  severity: AlertSeverity;
  message: string;
  is_read: boolean;
  created_at: string;
};


export type ActivityType =
  | "videoconference"
  | "streaming"
  | "online_gaming"
  | "web_browsing"
  | "file_upload";


export type ActivitySuitability =
  | "recommended"
  | "caution"
  | "not_recommended";


export type ActivityRecommendation = {
  activity: ActivityType;
  suitability: ActivitySuitability;
  message: string;
};


export type RecommendationResponse = {
  host_id: number;
  prediction_id: number;
  predicted_status: NetworkStatus;
  recommendations: ActivityRecommendation[];
};
import {
  Host,
  Measurement,
  NetworkAlert,
  Prediction,
  RecommendationResponse,
} from "../types/api";


const API_URL =
  process.env.EXPO_PUBLIC_API_URL;


if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured."
  );
}


async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    options
  );

  if (!response.ok) {
    let detail:
      | string
      | undefined;

    try {
      const body =
        await response.json();

      detail =
        body?.detail;
    } catch {
      detail = undefined;
    }

    throw new Error(
      detail ??
        `API request failed with status ${response.status}.`
    );
  }

  return response.json() as Promise<T>;
}


export async function getHosts(): Promise<
  Host[]
> {
  return request<Host[]>(
    "/hosts"
  );
}


export async function getMeasurements(
  hostId: number,
  options?: {
    startAt?: string;
    endAt?: string;
    status?: string;
    limit?: number;
  }
): Promise<Measurement[]> {
  const params =
    new URLSearchParams();

  if (options?.startAt) {
    params.set(
      "start_at",
      options.startAt
    );
  }

  if (options?.endAt) {
    params.set(
      "end_at",
      options.endAt
    );
  }

  if (options?.status) {
    params.set(
      "status",
      options.status
    );
  }

  if (options?.limit) {
    params.set(
      "limit",
      String(options.limit)
    );
  }

  const queryString =
    params.toString();

  const endpoint =
    queryString.length > 0
      ? `/hosts/${hostId}/measurements?${queryString}`
      : `/hosts/${hostId}/measurements`;

  return request<Measurement[]>(
    endpoint
  );
}


export async function getLatestMeasurement(
  hostId: number
): Promise<Measurement | null> {
  const measurements =
    await getMeasurements(
      hostId,
      {
        limit: 1,
      }
    );

  return measurements[0] ?? null;
}


export async function getLatestPrediction(
  hostId: number
): Promise<Prediction | null> {
  const response = await fetch(
    `${API_URL}/hosts/${hostId}/predictions/latest`
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `API request failed with status ${response.status}.`
    );
  }

  return response.json() as Promise<Prediction>;
}


export async function generateForecastPrediction(
  hostId: number,
  forecastFor: string
): Promise<Prediction> {
  return request<Prediction>(
    `/hosts/${hostId}/predictions/forecast`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        forecast_for:
          forecastFor,
      }),
    }
  );
}


export async function getRecommendations(
  hostId: number,
  predictionId: number
): Promise<RecommendationResponse> {
  return request<RecommendationResponse>(
    `/hosts/${hostId}/predictions/${predictionId}/recommendations`
  );
}


export async function getAlerts(
  hostId: number,
  limit = 100
): Promise<NetworkAlert[]> {
  return request<NetworkAlert[]>(
    `/hosts/${hostId}/alerts?limit=${limit}`
  );
}
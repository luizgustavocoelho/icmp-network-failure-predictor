import {
  Host,
  HostCreateInput,
  HostUpdateInput,
  LoginRequest,
  Measurement,
  NetworkAlert,
  Prediction,
  RecommendationResponse,
  RegisterRequest,
  TokenResponse,
  User,
} from "../types/api";

import {
  getAccessToken,
} from "./authStorage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured."
  );
}

type UnauthorizedHandler =
  () => void | Promise<void>;

let unauthorizedHandler:
  | UnauthorizedHandler
  | null = null;

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null
) {
  unauthorizedHandler = handler;

  return () => {
    if (
      unauthorizedHandler === handler
    ) {
      unauthorizedHandler = null;
    }
  };
}

type RequestConfiguration = {
  authenticated?: boolean;
  notifyUnauthorized?: boolean;
};

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  configuration: RequestConfiguration = {}
): Promise<T> {
  const {
    authenticated = true,
    notifyUnauthorized = true,
  } = configuration;

  const headers =
    new Headers(
      options?.headers
    );

  if (authenticated) {
    const token =
      await getAccessToken();

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    let detail:
      | string
      | undefined;

    try {
      const body =
        await response.json();

      if (
        typeof body?.detail
        === "string"
      ) {
        detail = body.detail;
      }
    } catch {
      detail = undefined;
    }

    if (
      response.status === 401 &&
      notifyUnauthorized &&
      unauthorizedHandler
    ) {
      void unauthorizedHandler();
    }

    throw new ApiError(
      detail ??
        `API request failed with status ${response.status}.`,
      response.status
    );
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function registerUser(
  data: RegisterRequest
): Promise<User> {
  return request<User>(
    "/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        data
      ),
    },
    {
      authenticated: false,
      notifyUnauthorized: false,
    }
  );
}

export async function loginUser(
  data: LoginRequest
): Promise<TokenResponse> {
  return request<TokenResponse>(
    "/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        data
      ),
    },
    {
      authenticated: false,
      notifyUnauthorized: false,
    }
  );
}

export async function getCurrentUser():
  Promise<User> {
  return request<User>(
    "/auth/me"
  );
}

export async function getHosts(): Promise<
  Host[]
> {
  return request<Host[]>(
    "/hosts"
  );
}

export async function getHost(
  hostId: number
): Promise<Host> {
  return request<Host>(
    `/hosts/${hostId}`
  );
}

export async function createHost(
  data: HostCreateInput
): Promise<Host> {
  return request<Host>(
    "/hosts",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        data
      ),
    }
  );
}

export async function updateHost(
  hostId: number,
  data: HostUpdateInput
): Promise<Host> {
  return request<Host>(
    `/hosts/${hostId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        data
      ),
    }
  );
}

export async function deleteHost(
  hostId: number
): Promise<void> {
  return request<void>(
    `/hosts/${hostId}`,
    {
      method: "DELETE",
    }
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
  try {
    return await request<Prediction>(
      `/hosts/${hostId}/predictions/latest`
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      return null;
    }

    throw error;
  }
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

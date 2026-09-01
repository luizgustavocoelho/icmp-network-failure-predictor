# REST API Specification

This document defines the initial REST API contract for the ICMP Network Failure Predictor.

The API will provide communication between the backend services and the mobile application.

The initial backend implementation is planned using FastAPI.

---

## 1. Base URL

During local development, the API may use an address similar to:

`http://localhost:8000`

The final deployment address will be defined later.

---

## 2. Data Format

The API will exchange data using JSON.

Example:

{
  "status": "ok"
}

---

## 3. HTTP Methods

The project will primarily use:

- `GET` — retrieve information
- `POST` — create information
- `PUT` — update information
- `DELETE` — remove information when applicable

---

## 4. HTTP Status Codes

Common status codes expected in the API include:

- `200 OK` — request completed successfully
- `201 Created` — resource created successfully
- `400 Bad Request` — invalid request
- `404 Not Found` — requested resource does not exist
- `422 Unprocessable Entity` — input validation error
- `500 Internal Server Error` — unexpected backend error

---

# 5. Hosts

Hosts represent network devices monitored by the system.

Examples:

- computer
- server
- router

---

## GET /hosts

Returns all registered monitored hosts.

Example response:

[
  {
    "id": 1,
    "name": "Main Router",
    "ip_address": "192.168.0.1",
    "description": "Primary local network router",
    "is_active": true
  }
]

---

## GET /hosts/{host_id}

Returns information about a specific monitored host.

Example:

`GET /hosts/1`

Example response:

{
  "id": 1,
  "name": "Main Router",
  "ip_address": "192.168.0.1",
  "description": "Primary local network router",
  "is_active": true
}

Possible response when the host does not exist:

`404 Not Found`

---

## POST /hosts

Creates a monitored host.

Example request:

{
  "name": "Main Router",
  "ip_address": "192.168.0.1",
  "description": "Primary local network router"
}

Example response:

{
  "id": 1,
  "name": "Main Router",
  "ip_address": "192.168.0.1",
  "description": "Primary local network router",
  "is_active": true
}

Expected status:

`201 Created`

---

## PUT /hosts/{host_id}

Updates information about an existing host.

Example request:

{
  "name": "Office Router",
  "ip_address": "192.168.0.1",
  "description": "Router used by the office network",
  "is_active": true
}

---

# 6. Measurements

Measurements represent network information collected through ICMP monitoring.

A measurement may include:

- monitored host
- timestamp
- latency
- packet loss
- response status
- classified network state

---

## GET /measurements

Returns network measurements.

Optional filters may be introduced later, such as:

- host
- start date
- end date
- status

Example response:

[
  {
    "id": 101,
    "host_id": 1,
    "measured_at": "2026-08-28T10:30:00",
    "latency_ms": 24.5,
    "packet_loss_pct": 0.0,
    "success": true,
    "status": "OK"
  }
]

---

## GET /measurements/{measurement_id}

Returns a specific network measurement.

Example response:

{
  "id": 101,
  "host_id": 1,
  "measured_at": "2026-08-28T10:30:00",
  "latency_ms": 24.5,
  "packet_loss_pct": 0.0,
  "success": true,
  "status": "OK"
}

---

## GET /hosts/{host_id}/measurements

Returns historical measurements for a specific host.

Example:

`GET /hosts/1/measurements`

Example response:

[
  {
    "id": 101,
    "measured_at": "2026-08-28T10:30:00",
    "latency_ms": 24.5,
    "packet_loss_pct": 0.0,
    "success": true,
    "status": "OK"
  },
  {
    "id": 102,
    "measured_at": "2026-08-28T10:35:00",
    "latency_ms": 32.1,
    "packet_loss_pct": 0.0,
    "success": true,
    "status": "OK"
  }
]

---

# 7. Manual Monitoring

The API may provide an endpoint for manually triggering an ICMP measurement during development and testing.

---

## POST /hosts/{host_id}/measure

Executes an ICMP monitoring operation for the selected host.

Example:

`POST /hosts/1/measure`

Example response:

{
  "measurement_id": 103,
  "host_id": 1,
  "measured_at": "2026-08-28T10:40:00",
  "latency_ms": 28.4,
  "packet_loss_pct": 0.0,
  "success": true,
  "status": "OK"
}

This endpoint is intended to support development, testing and demonstration.

Periodic monitoring may later be executed automatically by the backend service.

---

# 8. Network Status

---

## GET /hosts/{host_id}/status

Returns the latest known network condition for a monitored host.

Example response:

{
  "host_id": 1,
  "host_name": "Main Router",
  "status": "OK",
  "user_status": "Good",
  "last_measurement_at": "2026-08-28T10:40:00",
  "latency_ms": 28.4,
  "packet_loss_pct": 0.0
}

Possible internal statuses:

- `OK`
- `RISK`
- `FAILURE`

User-facing terminology may differ to provide simpler language.

---

# 9. Predictions

Predictions represent estimated future network conditions based on historical measurements and the analysis strategy defined by the project.

---

## GET /hosts/{host_id}/predictions

Returns available connectivity predictions for a host.

Example response:

[
  {
    "id": 20,
    "host_id": 1,
    "forecast_for": "2026-08-28T14:00:00",
    "predicted_status": "OK",
    "predicted_latency_ms": 30.2,
    "predicted_packet_loss_pct": 1.0,
    "confidence": null
  },
  {
    "id": 21,
    "host_id": 1,
    "forecast_for": "2026-08-28T15:00:00",
    "predicted_status": "RISK",
    "predicted_latency_ms": 85.4,
    "predicted_packet_loss_pct": 8.0,
    "confidence": null
  }
]

The use of a confidence value will depend on the final prediction method.

---

## GET /hosts/{host_id}/predictions/{prediction_id}

Returns details about a specific prediction.

Example response:

{
  "id": 21,
  "host_id": 1,
  "forecast_for": "2026-08-28T15:00:00",
  "predicted_status": "RISK",
  "predicted_latency_ms": 85.4,
  "predicted_packet_loss_pct": 8.0,
  "confidence": null
}

---

# 10. Activity Recommendations

The mobile application must help users understand whether the predicted connectivity is appropriate for common activities.

Supported activity types may include:

- video calls
- audio calls
- streaming
- online gaming
- web browsing
- file transfers
- messaging

---

## GET /hosts/{host_id}/recommendations

Returns activity recommendations based on the expected network condition.

Possible query parameters:

- activity
- date
- time

Example request:

`GET /hosts/1/recommendations?activity=video_call&time=2026-08-28T14:00:00`

Example response:

{
  "host_id": 1,
  "activity": "video_call",
  "forecast_for": "2026-08-28T14:00:00",
  "predicted_status": "OK",
  "recommendation": "The connection is expected to be suitable for a video call during this period."
}

Another example:

{
  "host_id": 1,
  "activity": "online_gaming",
  "forecast_for": "2026-08-28T15:00:00",
  "predicted_status": "RISK",
  "recommendation": "The connection may present instability during this period."
}

---

# 11. Alerts

Alerts represent network conditions that require user attention.

This feature may be introduced after the monitoring and classification functionality is stable.

---

## GET /alerts

Returns generated alerts.

Example response:

[
  {
    "id": 10,
    "host_id": 1,
    "severity": "warning",
    "message": "Network degradation detected.",
    "created_at": "2026-08-28T15:00:00"
  }
]

---

# 12. Health Check

---

## GET /health

Returns the current status of the backend service.

Example response:

{
  "status": "ok"
}

This endpoint can be used to verify whether the API is running.

---

# 13. Error Response Format

The API should return understandable error responses.

Example:

{
  "detail": "Host not found."
}

Another example:

{
  "detail": "Invalid IP address."
}

Errors exposed to users should avoid unnecessary technical details.

---

# 14. API Validation

Input data should be validated before processing.

Examples include:

- valid IP address format
- required host name
- valid identifiers
- valid date and time values
- supported activity types

FastAPI validation features may be used to support this process.

---

# 15. API Documentation

FastAPI provides automatic interactive API documentation.

During development, documentation may be available at:

`/docs`

and:

`/redoc`

These interfaces can be used to inspect and test API endpoints.

---

# 16. Initial Endpoint Summary

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Verify API availability |
| GET | `/hosts` | List monitored hosts |
| POST | `/hosts` | Register a host |
| GET | `/hosts/{host_id}` | Retrieve a host |
| PUT | `/hosts/{host_id}` | Update a host |
| POST | `/hosts/{host_id}/measure` | Execute an ICMP measurement |
| GET | `/hosts/{host_id}/measurements` | Retrieve host history |
| GET | `/hosts/{host_id}/status` | Retrieve current status |
| GET | `/measurements` | Retrieve measurements |
| GET | `/measurements/{measurement_id}` | Retrieve one measurement |
| GET | `/hosts/{host_id}/predictions` | Retrieve predictions |
| GET | `/hosts/{host_id}/predictions/{prediction_id}` | Retrieve prediction details |
| GET | `/hosts/{host_id}/recommendations` | Retrieve activity recommendation |
| GET | `/alerts` | Retrieve generated alerts |

---

# 17. API Development Order

The API should not be implemented all at once.

Recommended implementation order:

1. `GET /health`
2. `POST /hosts`
3. `GET /hosts`
4. `GET /hosts/{host_id}`
5. `POST /hosts/{host_id}/measure`
6. `GET /hosts/{host_id}/measurements`
7. `GET /hosts/{host_id}/status`
8. prediction endpoints
9. recommendation endpoint
10. alert endpoints

This order allows the monitoring and data foundation to be validated before prediction and recommendation features are introduced.

---

# 18. API Status

Current status:

**Initial API contract defined**

No endpoint should be considered implemented until the corresponding backend functionality exists and has been tested.

This specification may evolve as the project architecture and requirements are refined.

## Network Measurement Classification

Every new ICMP measurement is classified before being persisted.

The `status` property supports the following values:

- `OK`
- `RISK`
- `FAILURE`

Example successful measurement:

```json
{
  "id": 15,
  "host_id": 1,
  "measured_at": "2026-08-30T22:00:00Z",
  "latency_ms": 18.0,
  "packet_loss_pct": 0.0,
  "success": true,
  "status": "OK",
  "created_at": "2026-08-30T22:00:00Z"
}

Example degraded measurement:

{
  "id": 16,
  "host_id": 1,
  "measured_at": "2026-08-30T22:01:00Z",
  "latency_ms": 350.0,
  "packet_loss_pct": 0.0,
  "success": true,
  "status": "RISK",
  "created_at": "2026-08-30T22:01:00Z"
}

Example unavailable host:

{
  "id": 17,
  "host_id": 1,
  "measured_at": "2026-08-30T22:02:00Z",
  "latency_ms": null,
  "packet_loss_pct": 100.0,
  "success": false,
  "status": "FAILURE",
  "created_at": "2026-08-30T22:02:00Z"
}

## Measurement History

Historical measurements can be retrieved through:

`GET /hosts/{host_id}/measurements`

The endpoint supports optional filters:

- `status`
- `start_at`
- `end_at`
- `limit`

Example:

`GET /hosts/1/measurements?status=RISK&limit=10`

Results are returned with the most recent measurement first.

## Measurement Summary

Aggregated historical statistics are available through:

`GET /hosts/{host_id}/measurements/summary`

The response includes:

- total number of measurements;
- average latency;
- minimum latency;
- maximum latency;
- average packet loss;
- number of `OK` measurements;
- number of `RISK` measurements;
- number of `FAILURE` measurements.

## Alerts

Alerts can be retrieved through:

`GET /hosts/{host_id}/alerts`

Alert generation follows the network classification:

- `OK` → no alert
- `RISK` → `warning`
- `FAILURE` → `critical`

Each generated alert references the measurement that triggered it when applicable.

## Connectivity Prediction

A near-future connectivity prediction can be generated through:

`POST /hosts/{host_id}/prediction`

The prediction engine requires at least 3 historical measurements.

If insufficient historical data is available, the API returns:

`422 Unprocessable Entity`

Example:

```json
{
  "detail": "At least 3 measurements are required to generate a prediction."
}

A successful prediction returns:

{
  "id": 1,
  "host_id": 1,
  "generated_at": "2026-09-01T20:00:00Z",
  "forecast_for": "2026-09-01T20:05:00Z",
  "predicted_latency_ms": 35.0,
  "predicted_packet_loss_pct": 0.0,
  "predicted_status": "OK",
  "confidence": null
}

Prediction Fields
- `generated_at: time when the prediction was generated;`
- `forecast_for: future time represented by the prediction;`
- `predicted_latency_ms: estimated round-trip latency;`
- `predicted_packet_loss_pct: estimated packet loss;`
- `predicted_status: predicted network condition;`
- `confidence: reserved for a future defensible confidence metric.`

The default forecast horizon is currently 5 minutes.

## Prediction Queries

Generated predictions can be retrieved through:

`GET /hosts/{host_id}/predictions`

The endpoint returns stored predictions ordered by most recently generated first.

An optional `limit` parameter controls the maximum number of returned records.

Example:

`GET /hosts/1/predictions?limit=10`

The latest available prediction can be retrieved through:

`GET /hosts/{host_id}/predictions/latest`

If the host has no generated predictions, the latest prediction endpoint returns:

`404 Not Found`

## Prediction Time Selection

A connectivity prediction can be generated for a user-selected future date and time through:

POST /hosts/{host_id}/predictions/forecast

### Request Example

{
  "forecast_for": "2026-09-01T20:00:00-03:00"
}

### Forecast Time Rules

The selected forecast time:

- must be in the future;
- must include timezone information;
- is normalized to UTC before persistence.

If the selected forecast time is in the past or represents the current time, the API returns:

422 Unprocessable Entity

Example response:

{
  "detail": "forecast_for must be in the future."
}

If timezone information is missing, the API returns:

422 Unprocessable Entity

Example response:

{
  "detail": "forecast_for must include timezone information."
}

### Successful Response

A successful request returns a persisted prediction containing:

- prediction ID;
- monitored host ID;
- prediction generation timestamp;
- selected forecast timestamp;
- predicted latency;
- predicted packet loss;
- predicted network status;
- confidence value, when available.

Example:

{
  "id": 10,
  "host_id": 1,
  "generated_at": "2026-09-01T22:00:00Z",
  "forecast_for": "2026-09-01T23:00:00Z",
  "predicted_latency_ms": 32.5,
  "predicted_packet_loss_pct": 0.0,
  "predicted_status": "OK",
  "confidence": null
}

### Prediction Period Query

Stored predictions can also be filtered by forecast period through:

GET /hosts/{host_id}/predictions

Supported optional query parameters:

- start_at
- end_at
- limit

Example:

GET /hosts/1/predictions?start_at=2026-09-01T18:00:00-03:00&end_at=2026-09-01T22:00:00-03:00

The endpoint returns only predictions whose forecast_for timestamp falls inside the selected interval.

Predictions are ordered by forecast time.

### Invalid Period

If start_at is later than end_at, the API returns:

422 Unprocessable Entity

Example response:

{
  "detail": "start_at cannot be later than end_at."
}

### Timezone Handling

Client applications may send timezone-aware timestamps using offsets such as:

2026-09-01T20:00:00-03:00

The backend converts forecast timestamps to UTC before persistence.

For example:

2026-09-01T20:00:00-03:00

represents the same instant as:

2026-09-01T23:00:00Z

This provides consistent timestamp storage while allowing clients to work with their local timezone.

## Activity Recommendations

Activity recommendations are generated from an existing connectivity prediction.

The endpoint is:

GET /hosts/{host_id}/predictions/{prediction_id}/recommendations

The endpoint uses the predicted network condition to provide understandable guidance for common online activities.

Supported activities:

- videoconference;
- streaming;
- online gaming;
- web browsing;
- file upload.

### Recommendation Levels

The API uses three suitability levels:

- recommended;
- caution;
- not_recommended.

### OK Predictions

When the predicted network status is OK, all supported activities are considered recommended.

### RISK Predictions

When the predicted status is RISK:

- videoconference requires caution;
- streaming requires caution;
- online gaming requires caution;
- web browsing remains recommended;
- file uploads require caution.

The response includes simple explanatory messages describing possible degradation.

### FAILURE Predictions

When the predicted status is FAILURE, supported online activities are marked as not recommended because connectivity is expected to be unavailable.

### Response Example

{
  "host_id": 1,
  "prediction_id": 10,
  "predicted_status": "OK",
  "recommendations": [
    {
      "activity": "videoconference",
      "suitability": "recommended",
      "message": "The connection is suitable for video conferences."
    },
    {
      "activity": "streaming",
      "suitability": "recommended",
      "message": "The connection is suitable for streaming."
    }
  ]
}

Recommendations are derived dynamically and are not stored as separate database records.

This prevents unnecessary duplication because recommendations can always be recreated from the associated prediction.
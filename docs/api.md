# API Documentation

## ICMP Network Failure Predictor

This document describes the REST API exposed by the ICMP Network Failure Predictor backend.

The API is implemented using:

```text
Python
FastAPI
Pydantic
SQLAlchemy
PostgreSQL
```

The API provides access to:

- monitored hosts;
- ICMP measurements;
- measurement history;
- measurement summaries;
- alerts;
- connectivity predictions;
- custom future forecasts;
- prediction history;
- activity recommendations.

---

## 1. Base URL

During local development, the backend runs using:

```text
http://localhost:8000
```

When accessed by a physical mobile device on the same local network, the computer's LAN IP is used.

Example:

```text
http://192.168.x.x:8000
```

The backend can be started with:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 1.1 Authentication and Authorization

V2 includes account-based API access.

Authentication endpoints:

```http
POST /auth/register
POST /auth/login
GET /auth/me
```

Protected host operations require a valid access token.

Hosts are owned by users, and host-scoped operations validate ownership before exposing measurements, alerts or predictions.

The same IP may be registered by different users because uniqueness is scoped to the owning user.

## 2. Interactive API Documentation

FastAPI automatically exposes Swagger/OpenAPI documentation.

Swagger UI:

```text
http://localhost:8000/docs
```

The Swagger interface was used extensively during:

- development;
- endpoint validation;
- ICMP testing;
- prediction testing;
- failure testing;
- manual integration validation.

---

## 3. API Organization

The API is organized around the following resources:

```text
Hosts
Measurements
Measurement Summary
Alerts
Predictions
Recommendations
```

Main endpoint groups:

```text
/hosts
/hosts/{host_id}/measurements
/hosts/{host_id}/alerts
/hosts/{host_id}/predictions
```

---

# HOSTS

## 4. Create Host

### Endpoint

```http
POST /hosts
```

Creates a new monitored network host.

### Example Request

```json
{
  "name": "Google DNS",
  "ip_address": "8.8.8.8",
  "description": "Public DNS host used for network monitoring.",
  "is_active": true
}
```

### Main Validations

The API validates:

```text
IPv4 addresses
IPv6 addresses
duplicate IP addresses
required fields
```

Duplicate addresses are rejected.

Invalid addresses are also rejected.

---

## 5. List Hosts

### Endpoint

```http
GET /hosts
```

Returns the registered hosts.

### Example

```http
GET /hosts
```

Example host concepts returned by the API include:

```text
id
name
ip_address
description
is_active
created_at
updated_at
```

The mobile application uses this endpoint to locate an active host before retrieving measurements, predictions, history, or alerts.

---

## 6. Get Host by ID

### Endpoint

```http
GET /hosts/{host_id}
```

Example:

```http
GET /hosts/1
```

Returns the requested host.

If the host does not exist, the API returns an appropriate error response.

---

## 7. Update Host

### Endpoint

```http
PUT /hosts/{host_id}
```

Updates an existing host.

Example:

```http
PUT /hosts/1
```

The endpoint supports changing host information such as:

```text
name
IP address
description
active state
```

Input validation continues to apply during updates.

---

## 7.1 Delete Host

### Endpoint

```http
DELETE /hosts/{host_id}
```

Deletes a host owned by the authenticated user.

The mobile application uses this endpoint as part of the final host-management CRUD flow.

# ICMP MEASUREMENTS

## 8. Execute a Measurement

### Endpoint

```http
POST /hosts/{host_id}/measure
```

Executes a real ICMP measurement against the selected host.

Example:

```http
POST /hosts/1/measure
```

Conceptual flow:

```text
API Request
    ↓
Host Validation
    ↓
ICMP Monitor
    ↓
Operating-System Ping
    ↓
Latency / Packet Loss
    ↓
Network Classification
    ↓
Database Persistence
    ↓
Alert Evaluation
    ↓
API Response
```

A successful measurement contains information such as:

```text
host reference
measurement timestamp
latency
packet loss
success state
network status
```

Example conceptual result:

```json
{
  "host_id": 1,
  "latency_ms": 5.0,
  "packet_loss_pct": 0,
  "success": true,
  "status": "OK"
}
```

Exact response fields are defined by the current FastAPI schema.

---

## 9. Measurement Classification

Every measurement is classified as:

```text
OK
RISK
FAILURE
```

### OK

```text
host responds
latency < 300 ms
packet loss < 1%
```

### RISK

```text
host responds
and
latency >= 300 ms
```

or:

```text
host responds
and
packet loss >= 1%
and
packet loss < 100%
```

### FAILURE

```text
host does not respond
```

or:

```text
packet loss = 100%
```

These values are project-defined prototype rules.

---

## 10. Retrieve Measurement History

### Endpoint

```http
GET /hosts/{host_id}/measurements
```

Example:

```http
GET /hosts/1/measurements
```

The endpoint supports optional filters.

Supported concepts include:

```text
status
start_at
end_at
limit
```

Example:

```http
GET /hosts/1/measurements?limit=10
```

Example date-filtered request:

```http
GET /hosts/1/measurements?start_at=2026-09-01T00:00:00Z&end_at=2026-09-02T00:00:00Z
```

The mobile History screen uses this endpoint.

---

## 11. History Ordering

Historical measurements are returned with recent measurements available for presentation.

The mobile application uses:

```text
limit=1
```

when retrieving only the latest measurement.

Conceptual request:

```http
GET /hosts/1/measurements?limit=1
```

---

## 12. Filter by Status

Example:

```http
GET /hosts/1/measurements?status=RISK
```

The backend validates supported network status values.

This allows historical analysis of:

```text
healthy periods
degraded periods
failure periods
```

---

## 13. Measurement Summary

### Endpoint

```http
GET /hosts/{host_id}/measurements/summary
```

Example:

```http
GET /hosts/1/measurements/summary
```

This endpoint provides aggregated information about historical measurements.

The historical analysis conceptually includes values such as:

```text
measurement count
latency statistics
packet-loss statistics
```

The project also performs summary calculations in the mobile History interface.

---

# ALERTS

## 14. Retrieve Alerts

### Endpoint

```http
GET /hosts/{host_id}/alerts
```

Example:

```http
GET /hosts/1/alerts
```

The endpoint returns alerts associated with network measurements.

The mobile Alerts screen consumes this endpoint.

---

## 15. Alert Severity

The project uses alert severity according to network condition.

### RISK

```text
warning
```

### FAILURE

```text
critical
```

### OK

```text
no alert
```

Conceptual relationship:

```text
Measurement
    ↓
Classification
    ↓
┌──────────┬──────────┬────────────┐
│    OK    │   RISK   │  FAILURE   │
├──────────┼──────────┼────────────┤
│ No Alert │ Warning  │ Critical   │
└──────────┴──────────┴────────────┘
```

---

## 16. Alert Response Concepts

An alert may contain information such as:

```text
id
host_id
measurement reference
severity
message
read state
created timestamp
```

The exact response contract is defined by the backend OpenAPI schema.

The mobile interface presents alerts using:

```text
severity
translated title
translated explanation
timestamp
read/unread state
```

---

# PREDICTIONS

## 17. Generate Default Prediction

### Endpoint

```http
POST /hosts/{host_id}/prediction
```

Example:

```http
POST /hosts/1/prediction
```

This generates a future connectivity prediction using recent historical measurements.

The prediction service requires a minimum amount of historical information.

Current requirement:

```text
at least 3 measurements
```

---

## 18. Prediction Model

The current predictor is a:

```text
statistical baseline
```

It is based on recent network measurements and linear trend estimation.

It is not presented as a machine-learning model.

The prediction process evaluates:

```text
latency trend
packet-loss trend
future timestamp
predicted network state
```

---

## 19. Prediction Output

Prediction responses contain concepts such as:

```text
id
host_id
generated_at
forecast_for
predicted_latency_ms
predicted_packet_loss_pct
predicted_status
confidence
```

Current confidence value:

```text
null
```

A formal confidence metric has not yet been implemented.

---

## 20. Predicted Network Status

Predicted status uses the same classifier as real measurements.

Supported values:

```text
OK
RISK
FAILURE
```

This reuse ensures that current-state classification and future-state classification follow consistent business rules.

---

## 21. Packet-Loss Limits

Predicted packet loss is restricted to the valid range:

```text
0% to 100%
```

The automated test suite validates both lower and upper clamping behavior.

---

# CUSTOM FORECAST

## 22. Generate Prediction for a Custom Time

### Endpoint

```http
POST /hosts/{host_id}/predictions/forecast
```

Example:

```http
POST /hosts/1/predictions/forecast
```

### Request Body

```json
{
  "forecast_for": "2026-09-04T03:16:00-03:00"
}
```

The timestamp must represent a future time.

---

## 23. Timezone Requirement

The requested forecast timestamp must contain timezone information.

Valid example using a timezone offset:

```text
2026-09-04T03:16:00-03:00
```

Equivalent UTC value:

```text
2026-09-04T06:16:00Z
```

A timestamp without required timezone information is rejected.

---

## 24. Past Forecast Validation

Requests for timestamps in the past are rejected.

Conceptually:

```text
forecast_for <= current time
        ↓
validation error
```

This prevents logically invalid predictions.

---

# PREDICTION HISTORY

## 25. Retrieve Predictions

### Endpoint

```http
GET /hosts/{host_id}/predictions
```

Example:

```http
GET /hosts/1/predictions
```

Returns persisted predictions for the selected host.

Optional historical filtering is supported by the backend implementation.

---

## 26. Retrieve Latest Prediction

### Endpoint

```http
GET /hosts/{host_id}/predictions/latest
```

Example:

```http
GET /hosts/1/predictions/latest
```

The mobile Overview screen uses this endpoint.

If no prediction exists for the host, the API can return a not-found response.

The mobile application handles this state and displays:

```text
No prediction available
```

instead of showing fabricated data.

---

# ACTIVITY RECOMMENDATIONS

## 27. Retrieve Recommendations

### Endpoint

```http
GET /hosts/{host_id}/predictions/{prediction_id}/recommendations
```

Example:

```http
GET /hosts/1/predictions/10/recommendations
```

The endpoint evaluates a stored prediction and returns recommendations for supported network activities.

---

## 28. Supported Activities

The recommendation engine supports:

```text
VIDEOCONFERENCE
STREAMING
ONLINE_GAMING
WEB_BROWSING
FILE_UPLOAD
```

The mobile application presents these using user-friendly labels.

---

## 29. Recommendation States

Supported suitability values are:

```text
RECOMMENDED
CAUTION
NOT_RECOMMENDED
```

---

## 30. Recommendations for OK

When predicted network status is:

```text
OK
```

the supported activities are considered suitable.

Conceptually:

```text
Videoconference → RECOMMENDED
Streaming       → RECOMMENDED
Online gaming   → RECOMMENDED
Web browsing    → RECOMMENDED
File upload     → RECOMMENDED
```

---

## 31. Recommendations for RISK

When predicted status is:

```text
RISK
```

the recommendation policy is:

```text
Videoconference → CAUTION
Streaming       → CAUTION
Online gaming   → CAUTION
Web browsing    → RECOMMENDED
File upload     → CAUTION
```

This reflects the idea that normal web browsing is generally less sensitive than real-time or high-throughput activities.

---

## 32. Recommendations for FAILURE

When predicted status is:

```text
FAILURE
```

all supported activities are returned as:

```text
NOT_RECOMMENDED
```

---

## 33. Recommendation Messages

The backend returns semantic recommendation information.

The mobile application maps activity and suitability combinations to localized explanations.

This allows the recommendation interface to support:

```text
English
Portuguese
Spanish
```

without depending on an English-only backend message.

---

# MOBILE API INTEGRATION

## 34. Mobile API Configuration

The React Native application reads the backend address from:

```text
EXPO_PUBLIC_API_URL
```

Example development configuration:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.13:8000
```

The actual address depends on the development machine's LAN IP.

---

## 35. Environment Example

A repository-safe example can use:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000
```

Machine-specific `.env` files should not be committed with private configuration.

---

## 36. Mobile API Client

Backend communication is centralized in:

```text
apps/mobile/src/services/api.ts
```

The client uses the native:

```text
fetch
```

API.

No additional HTTP client dependency is required.

---

## 37. Mobile Overview Requests

The Overview screen conceptually performs:

```text
GET /hosts
        ↓
select active host
        ↓
GET /hosts/{id}/measurements?limit=1
        +
GET /hosts/{id}/predictions/latest
```

This provides:

```text
current measurement
current status
latest prediction
```

---

## 38. Mobile History Requests

The History screen uses:

```http
GET /hosts/{id}/measurements
```

with dynamically generated:

```text
start_at
end_at
limit
```

according to the selected range.

Available user ranges include:

```text
24 hours
7 days
30 days
```

---

## 39. Mobile Forecast Requests

The Forecast screen performs:

```text
GET /hosts
        ↓
select active host
        ↓
POST /hosts/{id}/predictions/forecast
        ↓
prediction created
        ↓
GET /hosts/{id}/predictions/{prediction_id}/recommendations
```

This provides both:

```text
future network prediction
```

and:

```text
activity recommendations
```

---

## 40. Mobile Alerts Requests

The Alerts screen performs:

```http
GET /hosts/{id}/alerts
```

and renders:

```text
empty state
warning alerts
critical alerts
summary counts
```

---

# HTTP AND ERROR BEHAVIOR

## 41. Successful Requests

Successful API operations return standard HTTP success responses appropriate to each endpoint.

Responses are encoded as:

```text
application/json
```

where applicable.

---

## 42. Validation Errors

FastAPI and Pydantic validate incoming data.

Examples of invalid input include:

```text
invalid IP address
invalid forecast timestamp
timestamp without timezone
forecast timestamp in the past
invalid measurement filters
invalid classification values
```

Such requests are rejected with validation responses.

---

## 43. Host Not Found

Endpoints that require a host ID validate that the host exists.

Example:

```http
GET /hosts/999999
```

returns an error instead of silently creating or assuming a host.

---

## 44. Inactive Hosts

Operations that require active monitoring validate host state where applicable.

An inactive host may remain registered in the database while monitoring operations are rejected.

This allows host configuration to be preserved without requiring deletion.

---

## 45. Duplicate Hosts

Duplicate IP addresses are rejected during host registration.

This prevents multiple conflicting monitored-host records using the same address.

---

## 46. Prediction Without Enough History

Prediction generation requires sufficient historical measurements.

Current minimum:

```text
3 measurements
```

When insufficient data exists, prediction generation is rejected instead of returning fabricated output.

---

## 47. Latest Prediction Not Found

When no prediction exists:

```http
GET /hosts/{host_id}/predictions/latest
```

may return a not-found response.

The mobile application explicitly handles this situation.

---

# DEVELOPMENT AND VALIDATION

## 48. Real Host Validation

The API was validated using:

```text
Google DNS
8.8.8.8
```

Real ICMP measurements produced:

```text
success = true
packet loss = 0%
status = OK
```

---

## 49. Failure Validation

A controlled unreachable host was used to validate:

```text
success = false
packet loss = 100%
status = FAILURE
```

The failure condition also generated a:

```text
critical
```

alert.

---

## 50. RISK Validation

The `RISK` state was validated through reproducible automated tests.

Covered conditions include:

```text
latency at the configured threshold
latency above the threshold
packet loss at the threshold
partial packet loss
high latency and packet loss
```

The automated chain also validated:

```text
RISK
    ↓
warning alert
    ↓
RISK prediction
    ↓
CAUTION recommendations
```

---

## 51. Prediction Validation

A real prediction-versus-measurement validation was performed using:

```text
Google DNS
8.8.8.8
```

Prediction:

```text
Predicted latency:
8.13 ms

Predicted packet loss:
0%

Predicted status:
OK
```

Later real measurement:

```text
Observed latency:
5.00 ms

Observed packet loss:
0%

Observed status:
OK
```

The status and packet-loss prediction matched the later real measurement.

---

# SECURITY AND CONFIGURATION

## 52. Environment Variables

Runtime-specific configuration is stored using environment variables.

Examples include:

```text
database connection configuration
mobile API base URL
```

Sensitive local configuration should not be committed to the repository.

---

## 53. Local Network Exposure

For physical-device development, FastAPI is started with:

```text
--host 0.0.0.0
```

This allows devices on the local network to reach the development server.

Example:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

This configuration is intended for controlled local development.

Production deployment should use an appropriate application-server and network-security configuration.

---

# API TESTING

## 54. Automated Tests

API and service behavior are covered by the backend automated test suite.

Final regression result:

```text
101 tests passed
101 passed
0 failed
6 warnings
```

The warnings are dependency deprecation warnings and are not functional failures.

---

## 55. Manual Swagger Validation

Swagger was used to manually validate important flows including:

```text
host registration
host listing
real ICMP measurement
measurement history
alerts
prediction generation
custom forecast
prediction history
activity recommendations
```

Swagger also provided evidence for the final project validation.

---

# API SUMMARY

## 56. Main Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/hosts` | Register monitored host |
| GET | `/hosts` | List hosts |
| GET | `/hosts/{host_id}` | Retrieve host |
| PUT | `/hosts/{host_id}` | Update host |
| POST | `/hosts/{host_id}/measure` | Execute ICMP measurement |
| GET | `/hosts/{host_id}/measurements` | Retrieve measurement history |
| GET | `/hosts/{host_id}/measurements/summary` | Retrieve measurement summary |
| GET | `/hosts/{host_id}/alerts` | Retrieve alerts |
| POST | `/hosts/{host_id}/prediction` | Generate default prediction |
| GET | `/hosts/{host_id}/predictions` | Retrieve prediction history |
| GET | `/hosts/{host_id}/predictions/latest` | Retrieve latest prediction |
| POST | `/hosts/{host_id}/predictions/forecast` | Generate custom future forecast |
| GET | `/hosts/{host_id}/predictions/{prediction_id}/recommendations` | Retrieve activity recommendations |

---

## 57. Complete API Flow

```text
Client
   ↓
FastAPI
   ↓
Host Validation
   ↓
Application Service
   ↓
┌──────────────────────────────┐
│ ICMP Monitoring             │
│ Measurement Processing      │
│ Classification              │
│ Alert Generation            │
│ Prediction                  │
│ Recommendations             │
└──────────────────────────────┘
   ↓
SQLAlchemy
   ↓
PostgreSQL
   ↓
JSON Response
   ↓
Mobile Application
```

---

## 58. API Design Principles

The API follows the following practical principles:

```text
Validate input before processing.

Do not fabricate measurements.

Do not generate predictions without sufficient data.

Use consistent network-status values.

Reuse classification logic.

Separate API routing from business logic.

Persist historical information.

Return explicit errors for invalid operations.

Keep environment-specific values outside UI code.

Expose machine-readable JSON contracts.

Use OpenAPI documentation for development and validation.
```

---

## 59. Current API Limitations

The current API is a functional authenticated academic prototype.

Implemented in V2:

```text
user authentication
authorization
multi-user host ownership
public HTTPS demo access
managed PostgreSQL compatibility
automatic monitoring
```

Current limitations include:

```text
backend runtime depends on the monitoring node
no distributed monitoring agents
no WebSocket real-time stream
no push-notification infrastructure
no formal public API versioning
no production rate limiting
no independent 24/7 compute guarantee
```

These limitations do not prevent the implemented monitoring, prediction, recommendation and mobile-integration flows from operating.

## 60. Future API Improvements

Future versions may add:

```text
formal API versioning
pagination
WebSocket updates
push-notification integration
multiple monitoring agents
background task queues
production rate limiting
advanced observability
independent 24/7 cloud compute
prediction-confidence endpoint
long-term analytics
```

## 61. Final API Status

Implemented and validated functionality:

```text
Host registration                         ✅
Host listing                              ✅
Host retrieval                            ✅
Host update                               ✅
IP validation                             ✅
Duplicate-host validation                 ✅
Active/inactive host support              ✅
Real ICMP measurement                     ✅
Measurement persistence                   ✅
Measurement history                       ✅
Measurement filters                       ✅
Measurement summary                       ✅
OK classification                         ✅
RISK classification                       ✅
FAILURE classification                    ✅
Warning alerts                            ✅
Critical alerts                           ✅
Default prediction                        ✅
Custom future prediction                  ✅
Timezone validation                       ✅
Past-time rejection                       ✅
Prediction persistence                    ✅
Prediction history                        ✅
Latest prediction                         ✅
Activity recommendations                  ✅
Swagger documentation                     ✅
Mobile API integration                    ✅
User authentication                       ✅
Multi-user authorization                   ✅
Automatic monitoring scheduler             ✅
Neon PostgreSQL validation                 ✅
Public HTTPS demo access                   ✅
Standalone Android APK integration         ✅
101/101 automated tests                      ✅
```

---

## 62. Conclusion

The ICMP Network Failure Predictor API provides the communication layer between low-level network monitoring and the mobile user interface.

The API transforms:

```text
HTTP request
```

into:

```text
network monitoring
```

which becomes:

```text
structured measurement data
```

which can then produce:

```text
classification
alerts
historical analysis
prediction
recommendations
```

The complete operational flow is:

```text
React Native / Swagger
        ↓
FastAPI
        ↓
Monitoring and Business Services
        ↓
PostgreSQL
        ↓
Prediction and Recommendation
        ↓
JSON Response
        ↓
User Interface
```

The current API has been validated using automated tests, real ICMP measurements, controlled failure scenarios, prediction experiments, and real mobile integration.

It provides a stable foundation for the current prototype and for future expansion into continuous network monitoring and larger-scale network observability.
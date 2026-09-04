# System Architecture

## ICMP Network Failure Predictor

This document describes the final architecture of the ICMP Network Failure Predictor.

The project combines:

- real ICMP monitoring;
- REST API services;
- PostgreSQL persistence;
- network classification;
- statistical connectivity prediction;
- activity recommendations;
- mobile visualization;
- internationalization;
- accessibility;
- Cisco Packet Tracer network simulation.

The system was designed using a layered architecture so that monitoring, persistence, prediction, presentation, and network simulation remain clearly separated.

---

## 1. Architecture Objective

The main goal of the architecture is to transform low-level network measurements into information that is easier for a user to understand.

The primary flow is:

```text
Network Host
    ↓
ICMP Echo Request / Reply
    ↓
Monitoring Service
    ↓
Measurement Processing
    ↓
Network Classification
    ↓
PostgreSQL
    ↓
Prediction Engine
    ↓
Recommendation Engine
    ↓
FastAPI
    ↓
React Native / Expo
    ↓
User
```

The system therefore connects:

```text
network monitoring
+
data persistence
+
network classification
+
prediction
+
recommendations
+
mobile presentation
```

---

## 2. High-Level Architecture

The project can be divided into five main architectural areas:

```text
1. Network Monitoring
2. Backend API
3. Data Persistence
4. Prediction and Recommendation
5. Mobile Application
```

Cisco Packet Tracer is used as an additional simulation environment for network-behavior validation.

---

## 3. Main Architecture Diagram

```text
                        ICMP NETWORK FAILURE PREDICTOR

┌─────────────────────────────────────────────────────────────────────┐
│                         NETWORK LAYER                               │
│                                                                     │
│  Monitored Host                                                    │
│  IPv4 / IPv6                                                       │
│       │                                                            │
│       │ ICMP Echo Request / Echo Reply                             │
│       ▼                                                            │
│  Operating System Ping                                             │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MONITORING LAYER                               │
│                                                                     │
│  icmp_monitor.py                                                   │
│                                                                     │
│  - executes system ping                                            │
│  - extracts latency                                                │
│  - calculates packet loss                                          │
│  - identifies success/failure                                      │
│  - generates structured ICMP measurements                          │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                                 │
│                                                                     │
│  Measurement Service                                               │
│  Network Classifier                                                │
│  Alert Service                                                     │
│  Prediction Service                                                │
│  Recommendation Service                                            │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                    │
│                                                                     │
│  PostgreSQL                                                        │
│                                                                     │
│  Hosts                                                             │
│  Measurements                                                      │
│  Alerts                                                            │
│  Predictions                                                       │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                   │
│                                                                     │
│  FastAPI                                                           │
│                                                                     │
│  Host endpoints                                                    │
│  Measurement endpoints                                             │
│  History endpoints                                                 │
│  Alert endpoints                                                   │
│  Prediction endpoints                                              │
│  Recommendation endpoints                                          │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                              │
│                                                                     │
│  React Native + Expo                                               │
│                                                                     │
│  Overview                                                          │
│  History                                                           │
│  Forecast                                                          │
│  Alerts                                                            │
│                                                                     │
│  English / Portuguese / Spanish                                    │
│  Accessibility Support                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Repository Architecture

The repository is organized as a monorepo.

Main structure:

```text
icmp-network-failure-predictor/
│
├── apps/
│   └── mobile/
│
├── services/
│   └── api/
│
├── database/
│
├── network/
│   └── packet-tracer/
│
├── docs/
│
├── assets/
│
├── .github/
│
├── README.md
└── CONTRIBUTING.md
```

Each area has a specific responsibility.

---

## 5. Backend Architecture

The backend is located in:

```text
services/api
```

Main technologies:

```text
Python
FastAPI
SQLAlchemy
PostgreSQL
Pydantic
Pytest
```

The backend is responsible for:

- monitored-host management;
- ICMP execution;
- network measurement processing;
- network-state classification;
- persistence;
- alerts;
- prediction;
- recommendations;
- API exposure.

---

## 6. Backend Application Structure

The backend follows a modular structure conceptually organized as:

```text
services/api/app/
│
├── main.py
│
├── config.py
│
├── database.py
│
├── models/
│
├── routers/
│
├── schemas/
│
└── services/
```

Responsibilities are separated between:

```text
Models
→ database entities

Schemas
→ API input/output validation

Services
→ business logic

Routers
→ HTTP endpoints

Database
→ PostgreSQL connection and persistence

Main
→ FastAPI application initialization
```

This separation reduces coupling between HTTP logic, business logic, and persistence.

---

## 7. FastAPI Application

The FastAPI application acts as the interface between backend functionality and external clients.

Main responsibilities include:

```text
receive HTTP requests
validate request data
invoke application services
retrieve database information
return JSON responses
expose Swagger/OpenAPI documentation
```

During development, the API can be accessed through:

```text
http://localhost:8000/docs
```

Swagger was extensively used during implementation and validation.

---

## 8. Host Management

Hosts represent network destinations monitored by the application.

Examples used during validation include:

```text
Google DNS
8.8.8.8
```

and:

```text
Cloudflare DNS
1.1.1.1
```

A controlled unreachable host was also used during failure validation.

Host functionality includes:

```text
creation
listing
retrieval
update
active/inactive status
IPv4 validation
IPv6 validation
duplicate prevention
```

---

## 9. ICMP Monitoring Layer

The ICMP monitoring component is responsible for communicating with monitored network hosts.

Main implementation:

```text
app/services/icmp_monitor.py
```

The service executes the operating system's native ping command.

Conceptual flow:

```text
Host IP
    ↓
System Ping Process
    ↓
ICMP Echo Request
    ↓
Remote Host
    ↓
ICMP Echo Reply
    ↓
Output Parser
    ↓
Structured Measurement
```

The implementation supports ping-output parsing in environments where latency may appear using English or Portuguese output formats.

---

## 10. ICMP Measurement Structure

The monitoring service creates structured information including concepts such as:

```text
host
measured_at
latency
packet loss
success
packets sent
packets received
```

This structured measurement is passed to the application service layer.

It is then classified and persisted.

---

## 11. Measurement Service

The measurement service connects monitoring with persistence and classification.

Conceptual flow:

```text
Host
    ↓
ICMP Monitor
    ↓
Raw ICMP Result
    ↓
Network Classifier
    ↓
Measurement Entity
    ↓
PostgreSQL
```

The service is responsible for making a network test useful to the rest of the application.

A ping command alone is not sufficient.

The application converts the ping result into structured historical data.

---

## 12. Network Classification

Each measurement is classified using project-defined rules.

Supported internal states:

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

A successful response with missing latency can also be treated conservatively as a risk condition.

### FAILURE

```text
host does not respond
```

or:

```text
packet loss = 100%
```

These thresholds are application policy for this prototype and are not presented as universal networking standards.

---

## 13. Classification Architecture

The classifier is intentionally separated from the ICMP execution layer.

Conceptually:

```text
ICMP Monitor
    ↓
Measurement Data
    ↓
Classifier
    ↓
OK / RISK / FAILURE
```

This allows the classification logic to be tested independently of real network conditions.

That separation was essential for reproducibly validating the `RISK` scenario.

---

## 14. Data Persistence

The application uses:

```text
PostgreSQL
```

as its relational database.

SQLAlchemy is used as the persistence layer between Python objects and database entities.

The primary stored concepts are:

```text
Hosts
Measurements
Alerts
Predictions
```

---

## 15. Host Data

Host information represents a monitored destination.

Typical data includes:

```text
id
name
ip_address
description
is_active
created_at
updated_at
```

The active status allows a host to remain registered while being excluded from normal monitoring behavior.

---

## 16. Measurement Data

Measurements represent historical network observations.

Typical fields include:

```text
id
host_id
measured_at
latency_ms
packet_loss_pct
success
status
created_at
```

Measurements are used by:

```text
Overview
History
Alert generation
Prediction engine
Statistical summaries
```

---

## 17. Alert Architecture

The alert system reacts to measurements that represent degraded or failed connectivity.

Conceptually:

```text
Measurement
    ↓
Network Status
    ↓
Alert Service
```

Behavior:

```text
OK
→ no alert

RISK
→ warning alert

FAILURE
→ critical alert
```

Alerts are persisted and exposed through the API.

---

## 18. Alert Flow

```text
ICMP Measurement
        ↓
Classifier
        ↓
     Status
        ↓
 ┌──────┼──────────┐
 │      │          │
OK     RISK     FAILURE
 │      │          │
 │      ▼          ▼
 │   WARNING    CRITICAL
 │      │          │
 └──────┴──────────┘
        ↓
   PostgreSQL
        ↓
     FastAPI
        ↓
  Mobile Alerts
```

---

## 19. Prediction Architecture

The system includes a prediction service that estimates future network behavior using recent historical measurements.

The current implementation is a:

```text
statistical baseline
```

rather than a machine-learning model.

The prediction mechanism uses recent historical data and linear trend estimation.

---

## 20. Prediction Input

The predictor uses recent measurements containing values such as:

```text
timestamp
latency
packet loss
status
```

The prediction service requires at least:

```text
3 historical measurements
```

before a forecast can be generated.

The current calculation window uses recent measurements rather than unlimited historical data.

---

## 21. Prediction Output

A generated prediction includes concepts such as:

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

At the current stage:

```text
confidence = null
```

because a statistically defensible confidence metric has not yet been implemented.

---

## 22. Prediction Processing

Conceptually:

```text
Recent Measurements
        ↓
Historical Window
        ↓
Linear Trend Estimation
        ↓
Future Latency Estimate
        ↓
Future Packet-Loss Estimate
        ↓
Network Classifier
        ↓
Predicted Status
        ↓
Prediction Persistence
```

Predicted packet loss is constrained to the valid range:

```text
0% to 100%
```

---

## 23. Custom Forecast Time

Users can request a prediction for a custom future timestamp.

The mobile application sends a timezone-aware value to the API.

Example:

```json
{
  "forecast_for": "2026-09-04T03:16:00-03:00"
}
```

The backend validates that:

```text
the timestamp contains timezone information
```

and:

```text
the requested time is in the future
```

---

## 24. Recommendation Engine

The recommendation engine converts predicted network status into user-oriented guidance.

Supported activities:

```text
Videoconference
Streaming
Online gaming
Web browsing
File upload
```

Recommendation states:

```text
RECOMMENDED
CAUTION
NOT_RECOMMENDED
```

---

## 25. Recommendation Rules

### Predicted OK

```text
Videoconference → RECOMMENDED
Streaming       → RECOMMENDED
Online gaming   → RECOMMENDED
Web browsing    → RECOMMENDED
File upload     → RECOMMENDED
```

### Predicted RISK

```text
Videoconference → CAUTION
Streaming       → CAUTION
Online gaming   → CAUTION
Web browsing    → RECOMMENDED
File upload     → CAUTION
```

### Predicted FAILURE

```text
Videoconference → NOT_RECOMMENDED
Streaming       → NOT_RECOMMENDED
Online gaming   → NOT_RECOMMENDED
Web browsing    → NOT_RECOMMENDED
File upload     → NOT_RECOMMENDED
```

This layer converts technical predictions into actionable information.

---

## 26. API Architecture

The API exposes the backend capabilities to the mobile application.

Main endpoint groups include:

```text
Hosts
Measurements
History
Alerts
Predictions
Recommendations
```

Examples include:

```text
POST /hosts
GET /hosts
GET /hosts/{id}
PUT /hosts/{id}
```

```text
POST /hosts/{id}/measure
GET /hosts/{id}/measurements
```

```text
GET /hosts/{id}/measurements/summary
GET /hosts/{id}/alerts
```

```text
POST /hosts/{id}/prediction
GET /hosts/{id}/predictions
GET /hosts/{id}/predictions/latest
POST /hosts/{id}/predictions/forecast
```

```text
GET /hosts/{host_id}/predictions/{prediction_id}/recommendations
```

---

## 27. API Data Flow

A typical mobile request follows:

```text
React Native Screen
        ↓
API Service
        ↓
HTTP Request
        ↓
FastAPI Router
        ↓
Application Service
        ↓
SQLAlchemy / PostgreSQL
        ↓
JSON Response
        ↓
React Native Screen
```

This keeps network requests separated from screen-layout code.

---

## 28. Mobile Architecture

The mobile application is located in:

```text
apps/mobile
```

Main technologies:

```text
React Native
Expo
Expo Router
TypeScript
AsyncStorage
```

The application uses file-based navigation through Expo Router.

---

## 29. Mobile Source Structure

The mobile source is organized conceptually as:

```text
src/
│
├── app/
├── components/
├── constants/
├── context/
├── hooks/
├── i18n/
├── services/
├── types/
└── utils/
```

Responsibilities:

```text
app
→ screens and navigation

components
→ reusable interface components

constants
→ theme and shared values

context
→ shared application state

i18n
→ translation resources

services
→ backend API communication

types
→ TypeScript data contracts

hooks
→ reusable React behavior

utils
→ shared helper logic
```

---

## 30. Mobile Navigation

The final mobile application uses four bottom tabs:

```text
Overview
History
Forecast
Alerts
```

Conceptually:

```text
                    Mobile Application

       ┌─────────┬─────────┬─────────┬─────────┐
       │Overview │ History │Forecast │ Alerts  │
       └─────────┴─────────┴─────────┴─────────┘
```

Expo Router controls navigation between these screens.

---

## 31. Overview Screen Architecture

The Overview screen retrieves:

```text
active host
latest measurement
latest prediction
```

It displays:

```text
current status
latency
packet loss
prediction
```

It also supports:

```text
pull-to-refresh
refresh when returning to the tab
loading state
error state
empty state
```

The screen no longer uses mock values.

Displayed network information comes from the backend API.

---

## 32. History Screen Architecture

The History screen consumes real measurement history.

It presents:

```text
period filters
summary statistics
latency trend
packet-loss trend
recent measurements
```

Supported periods include:

```text
24 hours
7 days
30 days
```

The chart and textual statistics are generated from API data.

---

## 33. Forecast Screen Architecture

The Forecast screen allows the user to choose:

```text
future date
future time
```

The mobile application converts the selected date/time into a timezone-aware timestamp and sends it to the forecast endpoint.

Conceptual flow:

```text
User Selects Date/Time
        ↓
React Native
        ↓
POST Prediction Forecast
        ↓
FastAPI
        ↓
Prediction Engine
        ↓
PostgreSQL
        ↓
Prediction Response
        ↓
Recommendation Request
        ↓
Recommendation Engine
        ↓
Mobile Result
```

---

## 34. Alerts Screen Architecture

The Alerts screen retrieves alert information from FastAPI.

It supports:

```text
empty state
warning alerts
critical alerts
alert summary
recent alert list
pull-to-refresh
```

The interface does not depend only on color.

Warning and critical information is also represented through:

```text
text
icons
titles
descriptions
```

---

## 35. Mobile API Service

The mobile application centralizes backend communication in:

```text
src/services/api.ts
```

The base API URL is obtained from:

```text
EXPO_PUBLIC_API_URL
```

This prevents the backend address from being hardcoded directly into screen components.

Conceptually:

```text
.env
   ↓
EXPO_PUBLIC_API_URL
   ↓
api.ts
   ↓
Screens
```

---

## 36. Local Development Network

When running the application on a physical mobile device, the phone cannot use:

```text
127.0.0.1
```

to access the computer's FastAPI instance.

Instead, the development environment uses the computer's LAN address.

The backend is started using:

```text
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The mobile device and development computer must be able to communicate through the same local network.

---

## 37. Internationalization Architecture

The mobile application supports:

```text
English
Portuguese
Spanish
```

Translations are stored in:

```text
src/i18n/translations.ts
```

Recommendation messages are organized in:

```text
src/i18n/recommendations.ts
```

The selected language is provided through:

```text
LanguageContext
```

---

## 38. Language Persistence

The selected language is persisted using:

```text
AsyncStorage
```

Storage key:

```text
@network-monitor/language
```

Flow:

```text
User selects language
        ↓
LanguageContext
        ↓
AsyncStorage
        ↓
Application restart
        ↓
Stored language restored
```

---

## 39. Accessibility Architecture

Accessibility requirements are integrated into the mobile architecture.

The application includes:

```text
48 dp minimum touch targets
accessible labels
accessibility roles
accessibility states
font scaling
scrollable content
safe-area handling
textual status descriptions
```

Status is never communicated using color alone.

For example:

```text
Green + OK
Yellow + RISK
Red + FAILURE
```

---

## 40. Theme Architecture

Shared visual values are centralized in:

```text
src/constants/theme.ts
```

The theme contains concepts such as:

```text
colors
spacing
border radius
typography
minimum touch target
```

This reduces repeated styling values and improves consistency across screens.

---

## 41. Reusable Components

Reusable UI elements include components such as:

```text
LanguageSelector
NetworkLineChart
```

The purpose of reusable components is to prevent duplicated interface logic and maintain consistent behavior.

---

## 42. Frontend Type Safety

TypeScript types are used to represent API data in the mobile application.

The API types include concepts such as:

```text
Host
Measurement
Prediction
NetworkAlert
ActivityRecommendation
RecommendationResponse
NetworkStatus
```

This reduces ambiguity between backend JSON data and frontend rendering logic.

---

## 43. Error Handling

The mobile application provides explicit states for API failures.

Conceptually:

```text
API Request
   ↓
Success?
 ┌───────┐
 │       │
Yes      No
 │       │
Data   Error State
 │       │
UI     Retry / Message
```

This prevents blank screens when backend communication fails.

---

## 44. Loading Handling

Operations that depend on network requests provide loading feedback.

Examples:

```text
Loading network data...
Generating forecast...
```

Loading indicators are combined with textual information.

---

## 45. Empty-State Architecture

Screens display explicit information when no data is available.

Examples:

```text
No measurements available
No prediction available
No active alerts
No measurements found for the selected period
```

This distinguishes:

```text
no data
```

from:

```text
system error
```

---

## 46. Refresh Architecture

Several screens support pull-to-refresh.

Example:

```text
User pulls screen
        ↓
RefreshControl
        ↓
API request
        ↓
Latest database information
        ↓
Screen state updated
```

The Overview refresh was validated using a new real ICMP measurement.

---

## 47. Real Measurement Flow

A complete real measurement follows:

```text
User / API Request
        ↓
POST /hosts/{id}/measure
        ↓
Host Retrieved
        ↓
ICMP Monitor
        ↓
Operating-System Ping
        ↓
Latency / Packet Loss
        ↓
Network Classifier
        ↓
Measurement Persisted
        ↓
Alert Evaluation
        ↓
JSON Response
```

The new measurement can then be retrieved by the mobile application.

---

## 48. Prediction Flow

```text
Historical Measurements
        ↓
Prediction Service
        ↓
Linear Trend Calculation
        ↓
Predicted Latency
        ↓
Predicted Packet Loss
        ↓
Network Classifier
        ↓
Predicted Status
        ↓
Prediction Persisted
        ↓
Recommendation Engine
        ↓
Mobile Forecast
```

---

## 49. Alert Flow

```text
Measurement
    ↓
Status
    ↓
┌───────────────┐
│      OK       │
│ No Alert      │
└───────────────┘

┌───────────────┐
│     RISK      │
│ WARNING Alert │
└───────────────┘

┌───────────────┐
│    FAILURE    │
│ CRITICAL Alert│
└───────────────┘
```

---

## 50. End-to-End Application Flow

The complete system architecture can be summarized as:

```text
Monitored Host
      ↓
ICMP Echo
      ↓
Python Monitor
      ↓
Measurement Service
      ↓
Classifier
      ↓
PostgreSQL
      ↓
Prediction Engine
      ↓
Recommendation Engine
      ↓
FastAPI
      ↓
Mobile API Client
      ↓
React Native
      ↓
Overview / History / Forecast / Alerts
      ↓
User
```

---

## 51. Cisco Packet Tracer Architecture

Cisco Packet Tracer is intentionally separated from the real application runtime.

Its topology is:

```text
PC-Monitor
192.168.10.10
      ↓
SW-Monitor
      ↓
R1
G0/0: 192.168.10.1
G0/1: 192.168.20.1
      ↓
SW-Target
      ↓
Server-Target
192.168.20.10
```

Networks:

```text
Monitoring Network
192.168.10.0/24
```

```text
Monitored Network
192.168.20.0/24
```

---

## 52. Packet Tracer Role

Packet Tracer demonstrates:

```text
IPv4 addressing
subnets
default gateways
switching
routing
ICMP Echo Request
ICMP Echo Reply
interface failure
connectivity recovery
```

It does not communicate directly with:

```text
FastAPI
PostgreSQL
React Native
```

This separation is intentional.

---

## 53. Real System Versus Packet Tracer

### Real System

```text
Real host
    ↓
Real operating-system ICMP
    ↓
Python
    ↓
FastAPI
    ↓
PostgreSQL
    ↓
Prediction
    ↓
Mobile
```

### Packet Tracer

```text
Simulated PC
    ↓
Simulated ICMP
    ↓
Simulated switches
    ↓
Simulated router
    ↓
Simulated server
```

The two environments answer different questions.

Packet Tracer demonstrates:

```text
How does the network communication work?
```

The application demonstrates:

```text
How can that communication be monitored,
classified, stored, predicted, and presented?
```

---

## 54. Validation Architecture

The architecture was validated through multiple layers.

### Automated Backend Validation

```text
82 tests
82 passed
0 failed
```

### Real Network Validation

```text
Google DNS
8.8.8.8

Real ICMP
Status: OK
```

### Controlled Failure Validation

```text
Unreachable test host
100% packet loss
Status: FAILURE
Critical alert
```

### Controlled Risk Validation

```text
Latency threshold
Partial packet loss
RISK classification
Warning alert
RISK prediction
CAUTION recommendations
```

### Prediction Validation

```text
Predicted:
8.13 ms
0% packet loss
OK

Observed:
5.00 ms
0% packet loss
OK
```

### Packet Tracer Validation

```text
Normal connectivity
Interface failure
100% packet loss
Recovery
0% final packet loss
```

---

## 55. Architectural Benefits

The chosen architecture provides several advantages.

### Separation of Concerns

```text
Monitoring
Classification
Persistence
Prediction
Recommendations
API
Presentation
```

are separated into different responsibilities.

### Testability

Core rules can be tested without requiring a real network failure.

### Maintainability

Changes to the mobile interface do not require changing ICMP monitoring logic.

### Extensibility

Future monitoring methods can be added without replacing the entire application.

### Reusability

FastAPI can support:

```text
mobile applications
web clients
external integrations
monitoring dashboards
```

without changing the core business logic.

---

## 56. Current Architectural Limitations

The current project is a functional prototype.

Some limitations remain.

### Local Development Deployment

The backend currently runs as a local development service.

A production deployment architecture is not implemented.

### Monitoring Scheduling

The prototype supports periodic monitoring logic, but a production-grade distributed scheduling infrastructure is outside the current scope.

### Prediction Model

The prediction engine is a statistical baseline.

It is not a machine-learning model.

### Prediction Confidence

No formal confidence metric is currently calculated.

Therefore:

```text
confidence = null
```

### User Authentication

Authentication and multi-user account management are outside the current project scope.

### Push Notifications

Alerts are displayed through the application.

Operating-system push-notification infrastructure is not part of the current prototype.

---

## 57. Future Architecture Opportunities

Future versions may introduce:

```text
Dockerized deployment
cloud-hosted FastAPI
managed PostgreSQL
background task workers
continuous monitoring scheduler
WebSocket real-time updates
push notifications
user authentication
multiple monitoring locations
machine-learning prediction
prediction confidence scoring
long-term analytics
observability and logging platform
CI/CD deployment pipeline
```

The current modular structure allows these capabilities to be added incrementally.

---

## 58. Architecture Principles

The project follows these practical architectural principles:

```text
Keep network monitoring independent from the UI.

Keep HTTP routing independent from business rules.

Keep classification independently testable.

Persist historical data before generating analytics.

Reuse classification logic for current and predicted states.

Convert technical predictions into user-oriented recommendations.

Keep local environment configuration outside source code.

Use typed contracts between backend and mobile.

Do not depend on color alone for network status.

Keep simulation separate from real monitoring.

Document limitations instead of overstating capabilities.
```

---

## 59. Final Architecture Status

The current architecture includes:

```text
Host management                         ✅
IPv4 / IPv6 validation                 ✅
Real ICMP monitoring                   ✅
Measurement persistence                ✅
Historical measurement retrieval       ✅
Network classification                 ✅
OK / RISK / FAILURE states             ✅
Warning alerts                         ✅
Critical alerts                        ✅
Prediction engine                      ✅
Custom future forecast                 ✅
Prediction history                     ✅
Activity recommendation engine         ✅
FastAPI REST interface                 ✅
Swagger / OpenAPI                      ✅
PostgreSQL persistence                 ✅
React Native mobile application        ✅
Overview screen                        ✅
History screen                         ✅
Forecast screen                        ✅
Alerts screen                          ✅
Pull-to-refresh                        ✅
Three-language interface               ✅
Language persistence                   ✅
Accessibility support                  ✅
Cisco Packet Tracer simulation         ✅
Normal network scenario                ✅
Failure scenario                       ✅
Recovery scenario                      ✅
Automated regression suite             ✅
Prediction vs real validation          ✅
```

---

## 60. Conclusion

The ICMP Network Failure Predictor uses a modular architecture that connects low-level network monitoring with higher-level user information.

The project transforms:

```text
ICMP communication
```

into:

```text
measurements
```

which become:

```text
network classifications
```

which are stored as:

```text
historical data
```

and then used to produce:

```text
predictions
```

and:

```text
activity recommendations
```

The results are exposed through FastAPI and presented in a React Native / Expo mobile interface.

The complete functional flow is:

```text
Network
    ↓
ICMP
    ↓
Python
    ↓
Classification
    ↓
PostgreSQL
    ↓
Prediction
    ↓
Recommendations
    ↓
FastAPI
    ↓
React Native
    ↓
User
```

Cisco Packet Tracer complements the real implementation by demonstrating the network behavior behind the monitoring process.

The final architecture therefore integrates:

```text
networking
backend development
database persistence
data analysis
prediction
mobile development
accessibility
internationalization
testing
simulation
```

into a single functional prototype.

This architecture provides a solid foundation for future evolution toward continuous monitoring, production deployment, advanced predictive analytics, and larger-scale network observability.
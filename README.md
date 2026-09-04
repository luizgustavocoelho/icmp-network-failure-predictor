# 🌐 ICMP Network Failure Predictor

> Network monitoring, failure detection, connectivity forecasting and activity recommendations powered by real ICMP measurements.

The **ICMP Network Failure Predictor** is a full-stack network-monitoring prototype that collects real ICMP measurements, classifies network conditions, stores historical data, predicts future connectivity behavior and converts technical results into user-friendly recommendations through a mobile application.

The project combines:

- Computer Networks
- Backend Development
- REST APIs
- PostgreSQL
- Data Analysis
- Statistical Prediction
- Mobile Development
- Accessibility
- Internationalization
- Automated Testing
- Cisco Packet Tracer

---

## 🎯 Project Goal

Traditional network tools often expose technical information such as:

```text
latency
packet loss
ping responses
timeouts
```

but do not necessarily translate those values into information that is immediately useful to non-specialist users.

This project transforms raw network measurements into:

```text
Current network condition
Historical behavior
Alerts
Future connectivity prediction
Activity recommendations
```

The main idea is:

```text
"What is happening with the network?"
                +
"What may happen next?"
                +
"What can I safely do with this connection?"
```

---

## 🚀 Main Features

### Real ICMP Monitoring

The backend executes real operating-system ping commands against registered hosts.

Collected information includes:

```text
Latency
Packet loss
Reachability
Measurement timestamp
```

---

### Network Classification

Each measurement is classified into one of three states:

```text
OK
RISK
FAILURE
```

Prototype rules:

| Status | Condition |
| --- | --- |
| `OK` | Host responds, latency < 300 ms and packet loss < 1% |
| `RISK` | Host responds but latency ≥ 300 ms or packet loss ≥ 1% |
| `FAILURE` | Host does not respond or packet loss reaches 100% |

These thresholds are project-defined prototype rules and are not intended to represent universal networking standards.

---

### Historical Monitoring

Measurements are persisted in PostgreSQL and can be analyzed over time.

The mobile application provides:

```text
24-hour history
7-day history
30-day history
Average latency
Minimum latency
Maximum latency
Average packet loss
Latency chart
Packet-loss chart
Recent measurements
```

---

### Alerts

Network degradation and failures generate alerts.

```text
OK
→ No degradation alert

RISK
→ WARNING

FAILURE
→ CRITICAL
```

Alerts are persisted by the backend and displayed in the mobile application.

---

### Connectivity Prediction

The project contains a prediction engine that estimates future network conditions using recent historical measurements.

The current implementation is a:

```text
Statistical baseline based on linear trend estimation
```

It is intentionally **not presented as a machine-learning model**.

The predictor estimates:

```text
Future latency
Future packet loss
Future network status
```

Supported predicted states:

```text
OK
RISK
FAILURE
```

---

### Custom Future Forecast

The user can choose a future date and time from the mobile application.

Example:

```text
Current time:
03:12

Selected forecast:
03:16
```

The mobile application sends a timezone-aware timestamp to FastAPI.

Example:

```json
{
  "forecast_for": "2026-09-04T03:16:00-03:00"
}
```

---

### Activity Recommendations

Predicted network conditions are converted into recommendations for common activities.

Supported activities:

```text
Videoconference
Streaming
Online gaming
Web browsing
File upload
```

Possible recommendations:

```text
RECOMMENDED
CAUTION
NOT_RECOMMENDED
```

Example policy:

| Activity | OK | RISK | FAILURE |
| --- | --- | --- | --- |
| Videoconference | Recommended | Caution | Not Recommended |
| Streaming | Recommended | Caution | Not Recommended |
| Online gaming | Recommended | Caution | Not Recommended |
| Web browsing | Recommended | Recommended | Not Recommended |
| File upload | Recommended | Caution | Not Recommended |

---

## 📱 Mobile Application

The mobile client was developed using:

```text
React Native
Expo
Expo Router
TypeScript
```

The final application contains four main screens:

### Overview

Displays:

```text
Active monitored host
Current network condition
Latest latency
Latest packet loss
Latest prediction
```

---

### History

Displays:

```text
Historical measurements
24h / 7d / 30d filters
Latency statistics
Packet-loss statistics
Charts
Recent measurements
```

---

### Forecast

Allows the user to:

```text
Choose a future date
Choose a future time
Generate a prediction
View predicted latency
View predicted packet loss
View predicted network status
View activity recommendations
```

---

### Alerts

Displays:

```text
Warning alerts
Critical alerts
Alert summary
Recent alerts
Empty state
```

---

## 🌍 Internationalization

The mobile application supports three languages:

```text
🇺🇸 English
🇧🇷 Português
🇪🇸 Español
```

The selected language is persisted using:

```text
AsyncStorage
```

Translated content includes:

```text
Navigation
Screen titles
Descriptions
Network statuses
Measurements
History
Forecast
Alerts
Activities
Recommendation states
Recommendation explanations
```

---

## ♿ Accessibility

Accessibility was treated as part of the interface architecture.

Implemented characteristics include:

```text
Minimum 48 dp touch targets
Font scaling
Scrollable layouts
Safe-area handling
Accessibility labels
Accessibility roles
Accessibility states
Explicit language selection
Status labels that do not depend only on color
Textual alternatives for important chart information
Loading states
Error states
Empty states
```

The interface was manually validated using increased Android system font size.

A complete certification-level multi-device TalkBack and VoiceOver audit remains future work.

Detailed documentation:

```text
docs/accessibility.md
```

---

## 🧠 System Architecture

The real application flow is:

```text
Monitored Host
      ↓
ICMP Echo Request / Reply
      ↓
Operating-System Ping
      ↓
Python ICMP Monitor
      ↓
Measurement Service
      ↓
Network Classifier
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

---

## 🏗 Architecture Layers

The system is divided into:

```text
Network Layer
      ↓
Monitoring Layer
      ↓
Service / Business Layer
      ↓
Data Layer
      ↓
REST API Layer
      ↓
Mobile Presentation Layer
```

This separation makes core business rules independently testable.

For example, a `RISK` condition can be validated without waiting for a real public network to randomly reach exactly 300 ms latency.

---

## 🛠 Technology Stack

### Backend

```text
Python
FastAPI
SQLAlchemy
Pydantic
Uvicorn
Pytest
```

### Database

```text
PostgreSQL
```

### Mobile

```text
React Native
Expo
Expo Router
TypeScript
AsyncStorage
React Native SVG
```

### Networking

```text
ICMP
IPv4
IPv6 validation
Cisco Packet Tracer
```

### Development

```text
Git
GitHub
Swagger / OpenAPI
VS Code
```

---

## 📂 Repository Structure

```text
icmp-network-failure-predictor/
│
├── apps/
│   └── mobile/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── constants/
│       │   ├── context/
│       │   ├── i18n/
│       │   ├── services/
│       │   └── types/
│       │
│       └── ...
│
├── services/
│   └── api/
│       ├── app/
│       │   ├── models/
│       │   ├── routers/
│       │   ├── schemas/
│       │   ├── services/
│       │   └── main.py
│       │
│       ├── tests/
│       └── ...
│
├── database/
│   ├── migrations/
│   └── schema.sql
│
├── network/
│   └── packet-tracer/
│
├── docs/
│   ├── accessibility.md
│   ├── api.md
│   ├── architecture.md
│   ├── classification.md
│   ├── glossary.md
│   ├── network-simulation.md
│   ├── requirements.md
│   └── testing.md
│
├── assets/
│   └── screenshots/
│
├── .github/
│   └── workflows/
│
├── CONTRIBUTING.md
└── README.md
```

---

## 🔌 API

The backend exposes a REST API through FastAPI.

During local development:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

Main API capabilities include:

```text
Host management
ICMP measurements
Measurement history
Measurement summaries
Alerts
Predictions
Custom forecasts
Prediction history
Activity recommendations
```

---

## 📡 Main API Endpoints

Examples include:

```http
POST /hosts
GET /hosts
GET /hosts/{host_id}
PUT /hosts/{host_id}
```

```http
POST /hosts/{host_id}/measure
GET /hosts/{host_id}/measurements
GET /hosts/{host_id}/measurements/summary
```

```http
GET /hosts/{host_id}/alerts
```

```http
GET /hosts/{host_id}/predictions
GET /hosts/{host_id}/predictions/latest
POST /hosts/{host_id}/predictions/forecast
```

```http
GET /hosts/{host_id}/predictions/{prediction_id}/recommendations
```

For the complete API documentation, see:

```text
docs/api.md
```

---

## 🗄 Data Model

The main persistent entities are:

```text
Hosts
Measurements
Alerts
Predictions
```

Conceptually:

```text
Host
 │
 ├── Measurements
 │      │
 │      └── Alerts
 │
 └── Predictions
        │
        └── Activity Recommendations
```

Measurements are stored historically and reused by the prediction engine.

---

## 📊 Prediction Model

The current predictor uses recent historical measurements.

Conceptually:

```text
Recent Measurements
        ↓
Historical Window
        ↓
Linear Trend Estimation
        ↓
Predicted Latency
        ↓
Predicted Packet Loss
        ↓
Network Classifier
        ↓
Predicted Status
```

The predictor requires at least:

```text
3 historical measurements
```

Predicted packet loss is constrained to:

```text
0% ≤ packet loss ≤ 100%
```

At the current project stage:

```text
confidence = null
```

because a statistically defensible confidence metric has not yet been implemented.

---

## 🔬 Prediction vs. Real Measurement Validation

A real forecast validation was performed against:

```text
Google DNS
8.8.8.8
```

A prediction was generated at approximately:

```text
03:12
```

for:

```text
03:16
```

### Predicted

```text
Latency:
8.13 ms

Packet loss:
0%

Status:
OK
```

### Observed at approximately 03:16:16

```text
Latency:
5.00 ms

Packet loss:
0%

Status:
OK
```

### Comparison

| Metric | Predicted | Observed |
| --- | ---: | ---: |
| Latency | 8.13 ms | 5.00 ms |
| Packet loss | 0% | 0% |
| Status | OK | OK |

Absolute latency difference:

```text
3.13 ms
```

The prediction matched the observed:

```text
Packet-loss condition ✅
Network classification ✅
```

This test demonstrates that the complete prediction pipeline works.

A single observation is **not** used to claim global statistical prediction accuracy.

---

## 🧪 Testing

The backend contains an extensive automated test suite.

Final regression result:

```text
82 tests collected
82 passed
0 failed
6 warnings
```

Success rate:

```text
100%
```

The warnings are dependency deprecation warnings and do not represent functional failures.

Test areas include:

```text
Host management
IPv4 validation
IPv6 validation
ICMP parsing
ICMP monitoring
Measurement persistence
Measurement history
Summary calculations
Network classification
Alerts
Predictions
Custom forecasts
Prediction history
Recommendations
API validation
```

---

## ✅ Validated Network States

### Real OK Scenario

Target:

```text
Google DNS
8.8.8.8
```

Observed:

```text
ICMP response successful
Packet loss: 0%
Latency below threshold
Status: OK
```

Result:

```text
PASSED ✅
```

---

### Controlled RISK Scenario

The `RISK` condition was validated through deterministic automated tests.

Covered behavior:

```text
Latency threshold
Partial packet loss
RISK classification
WARNING alert
RISK prediction
CAUTION recommendation
```

Focused test execution:

```text
5 tests
5 passed
```

Result:

```text
PASSED ✅
```

---

### Controlled FAILURE Scenario

A controlled unreachable host was used.

Observed:

```text
No successful response
100% packet loss
Status: FAILURE
CRITICAL alert
```

Result:

```text
PASSED ✅
```

---

## 🌐 Cisco Packet Tracer

The project also contains a network simulation created with Cisco Packet Tracer.

Final topology:

```text
PC-Monitor
192.168.10.10
      │
      ▼
SW-Monitor
      │
      ▼
R1
G0/0: 192.168.10.1
G0/1: 192.168.20.1
      │
      ▼
SW-Target
      │
      ▼
Server-Target
192.168.20.10
```

Two IPv4 networks are used:

```text
Monitoring Network:
192.168.10.0/24
```

```text
Monitored Network:
192.168.20.0/24
```

---

## 🔄 Packet Tracer Scenarios

### Normal Operation

```text
ICMP Echo Request ✅
ICMP Echo Reply ✅
Routing ✅
0% packet loss ✅
```

---

### Network Failure

The following router interface was disabled:

```text
R1 GigabitEthernet0/1
```

using:

```text
shutdown
```

Observed:

```text
Destination host unreachable
100% packet loss
Failed Simple PDU
```

---

### Recovery

The interface was restored using:

```text
no shutdown
```

Final result:

```text
Packets sent: 4
Packets received: 4
Packet loss: 0%
```

Detailed simulation documentation:

```text
docs/network-simulation.md
```

---

## 🧩 Real Monitoring vs. Simulation

The project intentionally separates both environments.

### Real Application

```text
Real Host
    ↓
Real ICMP
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
Simulated Switch
    ↓
Simulated Router
    ↓
Simulated Switch
    ↓
Simulated Server
```

Packet Tracer demonstrates:

```text
How the network communication works
```

while the application demonstrates:

```text
How network behavior can be measured,
classified, stored, predicted and presented.
```

---

## 📱 Running the Mobile Application

Navigate to:

```bash
cd apps/mobile
```

Install dependencies:

```bash
npm install
```

Configure the backend address using an environment variable.

Example:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000
```

Then start Expo:

```bash
npx expo start
```

For a physical phone, the computer and mobile device must be able to communicate through the same local network.

Do not use:

```text
127.0.0.1
```

as the computer address from a physical phone.

---

## ⚙️ Running the Backend

Navigate to:

```bash
cd services/api
```

Create or activate the Python virtual environment according to your local environment.

On Windows PowerShell, if the project virtual environment already exists:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the required backend dependencies if necessary.

Configure the PostgreSQL connection through the project's environment configuration.

Then start FastAPI:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger will be available at:

```text
http://localhost:8000/docs
```

---

## 🧪 Running the Tests

From:

```text
services/api
```

activate the Python virtual environment and run:

```bash
pytest -v
```

Validated project result:

```text
82 passed
0 failed
```

---

## 🔐 Environment Configuration

Environment-specific values should remain outside application source code.

Examples include:

```text
PostgreSQL connection configuration
Mobile API address
```

The mobile API base URL is configured using:

```text
EXPO_PUBLIC_API_URL
```

Local `.env` files containing machine-specific or sensitive configuration should not be committed.

---

## 📚 Documentation

Detailed documentation is available under:

```text
docs/
```

### Architecture

```text
docs/architecture.md
```

Describes the complete backend, database, prediction and mobile architecture.

### API

```text
docs/api.md
```

Documents the FastAPI interface and main application flows.

### Requirements

```text
docs/requirements.md
```

Maps the academic requirements to implemented functionality and validation.

### Classification

```text
docs/classification.md
```

Documents `OK`, `RISK` and `FAILURE` rules.

### Testing

```text
docs/testing.md
```

Documents automated and manual validation, including the final `82/82` regression result.

### Network Simulation

```text
docs/network-simulation.md
```

Documents the Cisco Packet Tracer topology, normal operation, failure and recovery.

### Accessibility

```text
docs/accessibility.md
```

Documents mobile accessibility decisions and validation.

### Glossary

```text
docs/glossary.md
```

Defines the primary network, backend, prediction and mobile terminology used by the project.

---

## 📋 Requirement Status

Original functional requirements:

```text
RF01 — Host registration           ✅
RF02 — ICMP monitoring             ✅
RF03 — Measurement persistence     ✅
RF04 — Network classification      ✅
RF05 — History and alerts          ✅
```

Extended functionality:

```text
RF06 — Connectivity prediction     ✅
RF07 — Prediction history          ✅
RF08 — Custom future forecast      ✅
RF09 — Activity recommendations    ✅
```

Additional implementation:

```text
React Native mobile application    ✅
PostgreSQL database                ✅
Three-language interface           ✅
Accessibility support              ✅
Packet Tracer simulation           ✅
Automated regression testing       ✅
Prediction vs actual validation    ✅
```

---

## 🏁 Current Project Status

```text
Backend API                         ✅
PostgreSQL                          ✅
Real ICMP Monitoring                ✅
Host Management                     ✅
Measurement Persistence             ✅
Historical Data                     ✅
OK Classification                   ✅
RISK Classification                 ✅
FAILURE Classification              ✅
Warning Alerts                      ✅
Critical Alerts                     ✅
Prediction Engine                   ✅
Custom Future Forecast              ✅
Prediction History                  ✅
Activity Recommendations            ✅
React Native Mobile App             ✅
Overview                            ✅
History                             ✅
Forecast                            ✅
Alerts                              ✅
English                             ✅
Portuguese                          ✅
Spanish                             ✅
Accessibility Implementation        ✅
Cisco Packet Tracer                 ✅
Network Failure Simulation          ✅
Network Recovery Simulation         ✅
82/82 Backend Tests                 ✅
Prediction vs Actual Validation     ✅
Technical Documentation             ✅
```

---

## ⚠️ Current Limitations

The project is currently a functional academic prototype.

The current scope does not include:

```text
Production cloud deployment
User authentication
Multi-tenant accounts
Distributed monitoring agents
Operating-system push notifications
WebSocket real-time streaming
Machine-learning model training
Formal prediction confidence
Commercial SLA guarantees
Formal multi-device accessibility certification
```

The ICMP result must also be interpreted correctly:

```text
ICMP failure
```

does not necessarily mean:

```text
every service on the destination is unavailable
```

Some systems intentionally block ICMP while continuing to provide other network services.

---

## 🔮 Future Improvements

Possible next steps include:

```text
Cloud deployment
Dockerized services
Managed PostgreSQL
Background monitoring workers
Continuous scheduling
Push notifications
WebSocket updates
User authentication
Multiple monitored hosts in the mobile UI
Advanced analytics
Long-term prediction validation
Prediction confidence scoring
Machine-learning models
Configurable classification thresholds
Jitter monitoring
Bandwidth measurements
HTTP/DNS/TCP health checks
Anomaly detection
Observability and structured logging
CI/CD deployment
```

---

## 💡 Key Engineering Decisions

Several choices were intentionally made during the project:

```text
Use real ICMP instead of mocked mobile data.

Keep Packet Tracer separate from the real runtime.

Keep classification independently testable.

Use deterministic tests for RISK conditions.

Reuse the classifier for measurements and predictions.

Do not label the prediction baseline as machine learning.

Do not invent a confidence score.

Do not rely only on color for network status.

Persist historical data before generating forecasts.

Translate technical predictions into activity recommendations.

Document limitations instead of overstating capabilities.
```

---

## 🎓 Academic Coverage

The project integrates concepts from multiple software and networking areas.

### Computer Networks

```text
ICMP
IPv4
Subnets
Default gateways
Switching
Routing
Packet loss
Latency
Packet Tracer
```

### Backend Engineering

```text
Python
FastAPI
REST
Pydantic
SQLAlchemy
Service architecture
Input validation
```

### Database

```text
PostgreSQL
Relational persistence
Historical measurements
Predictions
Alerts
```

### Data Analysis

```text
Historical trends
Latency analysis
Packet-loss analysis
Linear prediction
Prediction validation
```

### Mobile Development

```text
React Native
Expo
Expo Router
TypeScript
API integration
Responsive layouts
```

### Software Quality

```text
82 automated tests
Controlled scenarios
Real network tests
Integration validation
Accessibility
Internationalization
Documentation
```

---

## 🧭 Complete Project Flow

```text
                       ICMP NETWORK FAILURE PREDICTOR

                                  │
                                  ▼
                         MONITORED NETWORK HOST
                                  │
                                  ▼
                        ICMP ECHO REQUEST / REPLY
                                  │
                                  ▼
                          PYTHON ICMP MONITOR
                                  │
                                  ▼
                         STRUCTURED MEASUREMENT
                                  │
                                  ▼
                         NETWORK CLASSIFIER
                                  │
                  ┌───────────────┼───────────────┐
                  ▼               ▼               ▼
                 OK              RISK           FAILURE
                  │               │               │
                  │            WARNING         CRITICAL
                  │               │               │
                  └───────────────┼───────────────┘
                                  ▼
                              POSTGRESQL
                                  │
                     ┌────────────┴────────────┐
                     ▼                         ▼
                   HISTORY                PREDICTION
                                               │
                                               ▼
                                      RECOMMENDATIONS
                                               │
                     ┌─────────────────────────┘
                     ▼
                   FASTAPI
                     │
                     ▼
               REACT NATIVE / EXPO
                     │
          ┌──────────┼───────────┬───────────┐
          ▼          ▼           ▼           ▼
       OVERVIEW    HISTORY     FORECAST     ALERTS
                     │
                     ▼
                    USER
```

---

## 📈 Final Validation Summary

```text
Real OK scenario                        PASSED ✅
Controlled RISK scenario                PASSED ✅
Controlled FAILURE scenario             PASSED ✅
Warning alert                           PASSED ✅
Critical alert                          PASSED ✅
Prediction generation                   PASSED ✅
Custom future forecast                  PASSED ✅
Prediction history                      PASSED ✅
Activity recommendations                PASSED ✅
Prediction vs actual measurement        PASSED ✅
Mobile API integration                  PASSED ✅
Overview real data                      PASSED ✅
History visualization                   PASSED ✅
Forecast interface                      PASSED ✅
Alerts interface                        PASSED ✅
Internationalization                    PASSED ✅
Accessibility validation                PASSED ✅
Packet Tracer normal operation          PASSED ✅
Packet Tracer failure                   PASSED ✅
Packet Tracer recovery                  PASSED ✅
Automated backend regression            82/82 ✅
```

---

## 👨‍💻 Author

**Luiz Gustavo dos Santos Coelho**

Software-development student with a focus on Data Engineering and backend systems.

GitHub:

```text
https://github.com/luizgustavocoelho
```

LinkedIn:

```text
https://www.linkedin.com/in/luizgustavocoelho/
```

---

## 📌 Repository

```text
https://github.com/luizgustavocoelho/icmp-network-failure-predictor
```

---

## 📝 Final Note

The ICMP Network Failure Predictor started as a network-monitoring academic project and evolved into a complete functional prototype integrating:

```text
Networks
Backend
Database
Prediction
Mobile
Accessibility
Testing
Simulation
```

Its purpose is not merely to display ping values.

The project attempts to answer a more useful question:

> **What does the current and predicted network condition mean for the user?**

That idea connects the entire architecture:

```text
Measure
    ↓
Understand
    ↓
Predict
    ↓
Recommend
```
# System Requirements

## ICMP Network Failure Predictor

This document defines the functional, non-functional, mobile, networking, accessibility, validation, and technical requirements of the ICMP Network Failure Predictor.

It also provides traceability between the original academic requirements and the final implemented prototype.

---

## 1. Project Objective

The objective of the ICMP Network Failure Predictor is to monitor network connectivity using ICMP measurements and transform technical network data into information that can be understood and used by the end user.

The system must be able to process information such as:

```text
latency
packet loss
reachability
network condition
historical behavior
future prediction
alerts
activity recommendations
```

The complete product combines:

```text
ICMP monitoring
        ↓
network classification
        ↓
historical storage
        ↓
prediction
        ↓
recommendations
        ↓
mobile presentation
```

---

## 2. Original Core Functional Requirements

The project was initially defined around five core functional requirements.

```text
RF01 — Host registration
RF02 — Periodic ICMP monitoring
RF03 — Measurement storage
RF04 — Network classification
RF05 — History and alerts
```

All five core requirements were implemented.

---

# RF01 — HOST REGISTRATION

## 3. RF01 Description

The system must allow the registration of network hosts that can later be monitored through ICMP.

A host must contain sufficient information to identify the monitored destination.

Typical information includes:

```text
name
IP address
description
active state
```

---

## 4. RF01 Functional Behavior

The backend supports:

```text
host creation
host listing
host retrieval
host update
active/inactive state
IPv4 validation
IPv6 validation
duplicate IP prevention
```

Main API operations include:

```http
POST /hosts
GET /hosts
GET /hosts/{host_id}
PUT /hosts/{host_id}
```

---

## 5. RF01 Validation

The automated test suite validates:

```text
valid host creation
IPv4 addresses
IPv6 addresses
invalid IP rejection
duplicate IP rejection
host retrieval
host update
nonexistent host behavior
active/inactive state
```

Status:

```text
RF01 — IMPLEMENTED AND VALIDATED
```

---

# RF02 — PERIODIC ICMP MONITORING

## 6. RF02 Description

The system must be capable of checking registered network hosts using ICMP at defined intervals.

The purpose is to determine whether the destination responds and to collect network-quality information.

---

## 7. ICMP Monitoring Behavior

The monitoring service uses the operating system's ping functionality.

Conceptual flow:

```text
Registered Host
      ↓
System Ping
      ↓
ICMP Echo Request
      ↓
Remote Host
      ↓
ICMP Echo Reply
      ↓
Result Parser
```

The service extracts information such as:

```text
latency
packet loss
success
packets sent
packets received
measurement time
```

---

## 8. Periodic Monitoring Support

The backend includes periodic-monitoring behavior and validation for the monitoring interval.

Automated tests cover:

```text
periodic monitoring
invalid interval rejection
invalid packet count rejection
invalid timeout rejection
```

The academic prototype focuses primarily on the monitoring logic rather than a production-grade distributed scheduler.

Status:

```text
RF02 — IMPLEMENTED AND VALIDATED
```

---

# RF03 — MEASUREMENT STORAGE

## 9. RF03 Description

Each ICMP monitoring result must be stored for future analysis.

Historical storage is necessary to support:

```text
history
statistics
alerts
prediction
trend analysis
```

---

## 10. Stored Measurement Information

A persisted measurement can contain:

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

The application uses:

```text
PostgreSQL
```

for persistent relational storage.

---

## 11. Measurement API

A real measurement can be generated through:

```http
POST /hosts/{host_id}/measure
```

Historical measurements can be retrieved through:

```http
GET /hosts/{host_id}/measurements
```

A measurement summary is available through:

```http
GET /hosts/{host_id}/measurements/summary
```

---

## 12. RF03 Validation

The system was validated for:

```text
real ICMP execution
measurement persistence
measurement retrieval
historical ordering
date filters
status filters
result limits
summary calculation
```

Status:

```text
RF03 — IMPLEMENTED AND VALIDATED
```

---

# RF04 — NETWORK CLASSIFICATION

## 13. RF04 Description

The system must classify network conditions using the collected measurements.

Three states are supported:

```text
OK
RISK
FAILURE
```

---

## 14. Classification Policy

### OK

```text
success = true
latency < 300 ms
packet loss < 1%
```

### RISK

```text
success = true
```

and one or more degradation conditions such as:

```text
latency >= 300 ms
packet loss >= 1% and < 100%
missing latency despite successful response
```

### FAILURE

```text
success = false
```

or:

```text
packet loss = 100%
```

These thresholds are project-defined prototype rules.

They are not presented as universal network-quality standards.

---

## 15. RF04 Validation

The automated suite validates:

```text
healthy network
latency below threshold
latency at threshold
latency above threshold
packet loss below threshold
packet loss at threshold
partial packet loss
total packet loss
missing latency
unsuccessful measurement
invalid latency
invalid packet-loss values
```

Real and controlled scenarios were also used.

Status:

```text
RF04 — IMPLEMENTED AND VALIDATED
```

---

# RF05 — HISTORY AND ALERTS

## 16. RF05 Description

The system must allow users to review historical network behavior and identify relevant connectivity alerts.

---

## 17. History Functionality

Historical measurements support:

```text
24-hour analysis
7-day analysis
30-day analysis
date filtering
status filtering
latency statistics
packet-loss statistics
recent measurements
```

The mobile History screen presents:

```text
average latency
minimum latency
maximum latency
average packet loss
latency chart
packet-loss chart
recent measurement list
```

---

## 18. Alert Functionality

Alerts are related to network classification.

```text
OK
→ no degradation alert

RISK
→ WARNING

FAILURE
→ CRITICAL
```

The mobile Alerts screen displays:

```text
alert severity
title
description
timestamp
summary
empty state
```

Status:

```text
RF05 — IMPLEMENTED AND VALIDATED
```

---

# EXTENDED REQUIREMENTS

## 19. Project Evolution

After implementation of the original requirements, the prototype was extended with additional functionality.

The major extensions are:

```text
RF06 — Connectivity prediction
RF07 — Prediction history
RF08 — Custom future forecast
RF09 — Activity recommendations
```

These requirements extend the original academic scope without replacing it.

---

# RF06 — CONNECTIVITY PREDICTION

## 20. RF06 Description

The system must be able to estimate future network behavior using historical measurements.

The prediction service evaluates recent information such as:

```text
timestamp
latency
packet loss
```

---

## 21. Prediction Method

The current predictor is a:

```text
statistical baseline
```

based on linear trend estimation.

It is not presented as a machine-learning model.

The model requires at least:

```text
3 historical measurements
```

before generating a prediction.

---

## 22. Prediction Output

A prediction may contain:

```text
predicted_latency_ms
predicted_packet_loss_pct
predicted_status
generated_at
forecast_for
confidence
```

Current implementation:

```text
confidence = null
```

because no statistically defensible confidence metric has been implemented.

Status:

```text
RF06 — IMPLEMENTED AND VALIDATED
```

---

# RF07 — PREDICTION HISTORY

## 23. RF07 Description

Generated predictions must be persisted so that they can be retrieved later.

The system supports:

```text
prediction history
latest prediction
historical filtering
```

Main operations include:

```http
GET /hosts/{host_id}/predictions
GET /hosts/{host_id}/predictions/latest
```

The mobile Overview screen retrieves the latest available prediction.

Status:

```text
RF07 — IMPLEMENTED AND VALIDATED
```

---

# RF08 — CUSTOM FUTURE FORECAST

## 24. RF08 Description

The user must be able to select a specific future date and time for network prediction.

Main endpoint:

```http
POST /hosts/{host_id}/predictions/forecast
```

Example:

```json
{
  "forecast_for": "2026-09-04T03:16:00-03:00"
}
```

---

## 25. Forecast Validation Rules

The forecast timestamp must:

```text
contain timezone information
represent a future moment
```

The backend rejects:

```text
past timestamps
timestamps without required timezone information
invalid forecast values
```

The mobile Forecast screen provides date and time selection.

Status:

```text
RF08 — IMPLEMENTED AND VALIDATED
```

---

# RF09 — ACTIVITY RECOMMENDATIONS

## 26. RF09 Description

The system must convert predicted network conditions into recommendations that are understandable to the user.

Supported activities:

```text
VIDEOCONFERENCE
STREAMING
ONLINE_GAMING
WEB_BROWSING
FILE_UPLOAD
```

---

## 27. Recommendation States

The recommendation engine uses:

```text
RECOMMENDED
CAUTION
NOT_RECOMMENDED
```

---

## 28. Recommendation Matrix

| Activity | OK | RISK | FAILURE |
| --- | --- | --- | --- |
| Videoconference | RECOMMENDED | CAUTION | NOT_RECOMMENDED |
| Streaming | RECOMMENDED | CAUTION | NOT_RECOMMENDED |
| Online gaming | RECOMMENDED | CAUTION | NOT_RECOMMENDED |
| Web browsing | RECOMMENDED | RECOMMENDED | NOT_RECOMMENDED |
| File upload | RECOMMENDED | CAUTION | NOT_RECOMMENDED |

Status:

```text
RF09 — IMPLEMENTED AND VALIDATED
```

---

# MOBILE REQUIREMENTS

## 29. Mobile Application Requirement

The project must provide a functional mobile interface capable of presenting network information generated by the backend.

The mobile application was developed using:

```text
React Native
Expo
Expo Router
TypeScript
```

---

## 30. Main Mobile Screens

The final application contains four main tabs:

```text
Overview
History
Forecast
Alerts
```

Each screen consumes backend data rather than static demonstration values.

---

## 31. Overview Requirements

The Overview screen must present:

```text
active monitored host
current network condition
latest latency
latest packet loss
latest prediction
```

It must also support:

```text
loading state
error state
empty state
pull-to-refresh
refresh when returning to the screen
```

Status:

```text
IMPLEMENTED
```

---

## 32. History Requirements

The History screen must provide:

```text
historical measurements
24-hour filter
7-day filter
30-day filter
latency summary
packet-loss summary
charts
recent measurement list
```

Status:

```text
IMPLEMENTED
```

---

## 33. Forecast Requirements

The Forecast screen must allow the user to select:

```text
future date
future time
```

and display:

```text
predicted latency
predicted packet loss
predicted status
activity recommendations
```

Status:

```text
IMPLEMENTED
```

---

## 34. Alerts Requirements

The Alerts screen must display:

```text
warning alerts
critical alerts
alert summary
timestamps
empty state
```

Status:

```text
IMPLEMENTED
```

---

# INTERNATIONALIZATION REQUIREMENTS

## 35. Supported Languages

The mobile application supports:

```text
English
Portuguese
Spanish
```

The selected language must remain available after application restart.

Persistence is implemented using:

```text
AsyncStorage
```

Status:

```text
IMPLEMENTED
```

---

## 36. Translation Scope

The translation system covers:

```text
navigation
screen titles
screen descriptions
status labels
measurements
history
forecast
alerts
activities
recommendation states
recommendation explanations
```

Status:

```text
IMPLEMENTED
```

---

# ACCESSIBILITY REQUIREMENTS

## 37. Accessibility Objective

The mobile application must remain understandable and usable without requiring users to rely exclusively on visual color cues or advanced networking terminology.

---

## 38. Touch Targets

Interactive elements should provide a minimum target of:

```text
48 x 48 dp
```

Status:

```text
IMPLEMENTED
```

---

## 39. Color Independence

Status information must not depend exclusively on color.

The interface uses combinations such as:

```text
color
+
status label
+
description
+
icon
```

Examples:

```text
OK
RISK
FAILURE
```

and:

```text
RECOMMENDED
CAUTION
NOT_RECOMMENDED
```

Status:

```text
IMPLEMENTED
```

---

## 40. Font Scaling

The application must support operating-system text scaling without making primary content inaccessible.

Manual validation was performed using increased Android font size.

Status:

```text
IMPLEMENTED AND MANUALLY VALIDATED
```

---

## 41. Screen-Reader Support

Important interface components should provide semantic accessibility information using React Native properties such as:

```text
accessibilityLabel
accessibilityRole
accessibilityState
accessibilityHint
```

The prototype includes this implementation foundation.

A complete certification-level multi-device TalkBack and VoiceOver audit is outside the current project scope.

Status:

```text
IMPLEMENTED
FORMAL MULTI-DEVICE AUDIT: FUTURE WORK
```

---

## 42. Contrast Requirement

The accessibility design targets:

```text
4.5:1
for normal text
```

and:

```text
3:1
for large text and relevant graphical elements
```

The interface was designed according to these targets.

A dedicated automated contrast audit remains a future formal validation activity.

---

## 43. Predictable Navigation

The application must provide consistent navigation.

The final implementation uses four persistent bottom tabs:

```text
Overview
History
Forecast
Alerts
```

Status:

```text
IMPLEMENTED
```

---

# NETWORK SIMULATION REQUIREMENTS

## 44. Packet Tracer Requirement

The project must include a Cisco Packet Tracer simulation demonstrating network behavior related to ICMP monitoring.

The final topology is:

```text
PC-Monitor
    ↓
SW-Monitor
    ↓
R1
    ↓
SW-Target
    ↓
Server-Target
```

---

## 45. Simulated Networks

Monitoring network:

```text
192.168.10.0/24
```

Monitored network:

```text
192.168.20.0/24
```

---

## 46. Packet Tracer Addressing

```text
PC-Monitor
192.168.10.10/24
Gateway: 192.168.10.1
```

```text
R1 G0/0
192.168.10.1/24
```

```text
R1 G0/1
192.168.20.1/24
```

```text
Server-Target
192.168.20.10/24
Gateway: 192.168.20.1
```

---

## 47. Packet Tracer Required Scenarios

The simulation must demonstrate:

```text
normal connectivity
ICMP Echo Request
ICMP Echo Reply
network failure
connectivity recovery
```

All scenarios were successfully reproduced.

Status:

```text
IMPLEMENTED AND VALIDATED
```

---

# PREDICTION VALIDATION REQUIREMENT

## 48. Prediction Versus Actual Measurement

The project must compare a generated prediction with a later real network measurement.

A validation experiment was performed using:

```text
Google DNS
8.8.8.8
```

Predicted:

```text
Latency: 8.13 ms
Packet loss: 0%
Status: OK
```

Observed later:

```text
Latency: 5.00 ms
Packet loss: 0%
Status: OK
```

Absolute latency difference:

```text
3.13 ms
```

Result:

```text
Packet-loss classification matched
Network status matched
```

This experiment demonstrates operational prediction behavior.

It does not establish global statistical accuracy.

Status:

```text
IMPLEMENTED AND VALIDATED
```

---

# VALIDATION REQUIREMENTS

## 49. OK Scenario

A real healthy-network scenario must be demonstrated.

Host used:

```text
Google DNS
8.8.8.8
```

Observed:

```text
successful ICMP response
0% packet loss
latency below 300 ms
status = OK
```

Status:

```text
PASSED
```

---

## 50. RISK Scenario

A degraded-network scenario must be validated.

Because exact degradation is difficult to reproduce reliably over a public network, controlled automated tests were used.

Validated behavior included:

```text
latency threshold
partial packet loss
RISK classification
WARNING alert
RISK prediction
CAUTION recommendation
```

Focused validation result:

```text
5 tests
5 passed
```

Status:

```text
PASSED
```

---

## 51. FAILURE Scenario

A controlled unreachable host was used to validate failure behavior.

Observed:

```text
success = false
packet loss = 100%
status = FAILURE
critical alert
```

Status:

```text
PASSED
```

---

# TESTING REQUIREMENTS

## 52. Automated Testing

The backend must include automated tests for critical functionality.

Final regression execution:

```text
82 tests collected
82 passed
0 failed
6 warnings
```

The warnings are dependency deprecation warnings rather than functional failures.

Status:

```text
PASSED
```

---

## 53. Main Automated Test Areas

The suite covers:

```text
host management
IP validation
ICMP parsing
real-monitoring service behavior
measurement persistence
history
summary
classification
alerts
prediction
forecast
prediction history
recommendations
API validation
```

---

# DATA REQUIREMENTS

## 54. Measurement Data

The project must manage historical data containing concepts such as:

```text
timestamp
latency
packet loss
network state
```

These values support:

```text
historical visualization
summary statistics
prediction
alerts
validation
```

Status:

```text
IMPLEMENTED
```

---

## 55. Prediction Data

Prediction records must contain sufficient information to identify:

```text
host
generation time
forecast time
predicted latency
predicted packet loss
predicted status
```

Status:

```text
IMPLEMENTED
```

---

# NON-FUNCTIONAL REQUIREMENTS

## 56. Maintainability

The codebase should separate responsibilities between:

```text
routers
services
models
schemas
database
mobile screens
mobile services
mobile types
translations
```

Status:

```text
IMPLEMENTED
```

---

## 57. Testability

Core business rules should be independently testable without requiring unpredictable real-world network conditions.

Examples:

```text
classification
alert generation
prediction
recommendation logic
```

Status:

```text
IMPLEMENTED
```

---

## 58. Usability

The mobile interface should avoid unnecessarily exposing raw technical networking information.

Primary screens focus on:

```text
network status
latency
packet loss
historical trend
prediction
alerts
recommendations
```

Status:

```text
IMPLEMENTED
```

---

## 59. Responsiveness

The mobile application should adapt to different screen dimensions and text sizes.

The interface uses mechanisms such as:

```text
flex layouts
ScrollView
dynamic width
safe areas
font scaling
```

Status:

```text
IMPLEMENTED
```

---

## 60. Configuration

Environment-specific values must not be unnecessarily hardcoded into application screens.

The mobile API address is configured using:

```text
EXPO_PUBLIC_API_URL
```

Sensitive local configuration is kept outside version-controlled source where appropriate.

Status:

```text
IMPLEMENTED
```

---

# SCOPE BOUNDARIES

## 61. Current Prototype Scope

The current project includes:

```text
real ICMP monitoring
host management
historical storage
network classification
alerts
prediction
recommendations
REST API
mobile application
three languages
accessibility implementation
Packet Tracer simulation
automated testing
```

---

## 62. Out-of-Scope Functionality

The current academic prototype does not require:

```text
user authentication
multi-tenant accounts
production cloud deployment
commercial SLA guarantees
distributed monitoring agents
push-notification infrastructure
real-time WebSocket streaming
machine-learning model training
formal prediction-confidence scoring
full accessibility certification
```

These may be considered future improvements.

---

# REQUIREMENT TRACEABILITY

## 63. Functional Requirement Traceability Matrix

| Requirement | Description | Main Implementation | Validation | Status |
| --- | --- | --- | --- | --- |
| RF01 | Register monitored hosts | Hosts API, models, schemas | Automated tests + Swagger | ✅ |
| RF02 | Execute ICMP monitoring | `icmp_monitor.py` | Automated tests + real ping | ✅ |
| RF03 | Store measurements | PostgreSQL + measurement service | API/history validation | ✅ |
| RF04 | Classify network state | Network classifier | OK/RISK/FAILURE tests | ✅ |
| RF05 | History and alerts | History + alert services | API + mobile validation | ✅ |
| RF06 | Predict connectivity | Prediction service | Automated + real comparison | ✅ |
| RF07 | Store/retrieve predictions | Prediction persistence/API | Automated tests | ✅ |
| RF08 | Custom future forecast | Forecast endpoint + mobile picker | Automated + manual validation | ✅ |
| RF09 | Activity recommendations | Recommendation service | Automated + mobile validation | ✅ |

---

## 64. Interface Requirement Traceability

| Requirement | Implementation | Status |
| --- | --- | --- |
| Overview screen | React Native / Expo | ✅ |
| History screen | React Native / Expo | ✅ |
| Forecast screen | React Native / Expo | ✅ |
| Alerts screen | React Native / Expo | ✅ |
| Real API integration | Mobile API service | ✅ |
| Historical charts | React Native SVG | ✅ |
| Future date selection | Date picker | ✅ |
| Future time selection | Time picker | ✅ |
| Pull-to-refresh | RefreshControl | ✅ |
| Error states | Mobile screens | ✅ |
| Empty states | Mobile screens | ✅ |
| Loading feedback | Mobile screens | ✅ |

---

## 65. Accessibility Requirement Traceability

| Requirement | Status |
| --- | --- |
| Minimum 48 dp touch targets | ✅ |
| Status not dependent only on color | ✅ |
| Explicit text labels | ✅ |
| Font scaling support | ✅ |
| Increased-font manual validation | ✅ |
| Scrollable layouts | ✅ |
| Safe-area support | ✅ |
| Accessibility labels | ✅ |
| Accessibility roles | ✅ |
| Accessibility states | ✅ |
| Explicit language selector | ✅ |
| Three supported languages | ✅ |
| Formal multi-device screen-reader audit | Future |
| Automated contrast audit | Future |

---

## 66. Network Requirement Traceability

| Requirement | Status |
| --- | --- |
| Packet Tracer topology | ✅ |
| Two IPv4 networks | ✅ |
| Layer 2 switching | ✅ |
| Layer 3 routing | ✅ |
| Default gateways | ✅ |
| ICMP Echo Request | ✅ |
| ICMP Echo Reply | ✅ |
| Normal network scenario | ✅ |
| Controlled failure | ✅ |
| 100% packet-loss demonstration | ✅ |
| Recovery scenario | ✅ |

---

## 67. Validation Traceability

```text
Real OK condition                         ✅
Controlled RISK condition                 ✅
Real controlled FAILURE condition         ✅
Warning alert                             ✅
Critical alert                            ✅
Prediction generation                     ✅
Prediction history                        ✅
Custom future forecast                    ✅
Prediction versus real measurement        ✅
Activity recommendations                  ✅
Mobile integration                        ✅
Internationalization                      ✅
Accessibility visual validation           ✅
Packet Tracer normal scenario             ✅
Packet Tracer failure scenario            ✅
Packet Tracer recovery                    ✅
82/82 automated backend tests              ✅
```

---

## 68. Functional Flow Traceability

The original project requirement:

```text
Device
    ↓
ICMP Echo Request / Reply
    ↓
Collect latency, loss and availability
    ↓
Store information
    ↓
Predict / classify / alert
    ↓
Present to user
```

is implemented as:

```text
Monitored Host
    ↓
Operating-System ICMP
    ↓
icmp_monitor.py
    ↓
Measurement Service
    ↓
Network Classifier
    ↓
PostgreSQL
    ↓
Prediction Service
    ↓
Alert / Recommendation Services
    ↓
FastAPI
    ↓
React Native / Expo
    ↓
User
```

---

## 69. Final Requirement Status

The core academic backlog is complete.

```text
RF01     ✅
RF02     ✅
RF03     ✅
RF04     ✅
RF05     ✅
```

The extended functional backlog is also complete.

```text
RF06     ✅
RF07     ✅
RF08     ✅
RF09     ✅
```

The final prototype also includes:

```text
Mobile application                  ✅
Real API integration                ✅
PostgreSQL persistence              ✅
Prediction                          ✅
Activity recommendations            ✅
Internationalization                ✅
Accessibility implementation        ✅
Packet Tracer simulation             ✅
Automated tests                     ✅
Manual integration tests            ✅
Prediction vs actual validation      ✅
```

---

## 70. Conclusion

The ICMP Network Failure Predictor satisfies the original core functional requirements and extends them with prediction, recommendation, mobile, accessibility, and network-simulation capabilities.

The original flow:

```text
ICMP monitoring
        ↓
measurement
        ↓
classification
        ↓
storage
        ↓
history and alerts
```

was successfully implemented.

The final project extends this architecture into:

```text
ICMP monitoring
        ↓
measurement
        ↓
classification
        ↓
PostgreSQL
        ↓
historical analysis
        ↓
prediction
        ↓
activity recommendations
        ↓
FastAPI
        ↓
React Native / Expo
        ↓
accessible multilingual interface
```

The requirements are supported by automated tests, real ICMP measurements, controlled degradation scenarios, Packet Tracer simulation, mobile integration, and prediction-versus-observed-result validation.

The current prototype therefore provides a complete implementation of the project's functional core while also establishing a foundation for future production deployment and more advanced predictive network analysis.
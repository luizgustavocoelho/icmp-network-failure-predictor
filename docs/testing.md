# Testing Strategy

## ICMP Network Failure Predictor

This document describes the automated tests, integration tests, manual validation scenarios, network simulation tests, mobile validation, and prediction validation performed for the ICMP Network Failure Predictor.

---

## 1. Objective

The purpose of the testing process is to validate that the system can:

- register and manage monitored hosts;
- execute real ICMP measurements;
- persist network measurements;
- classify network conditions;
- generate alerts;
- calculate connectivity predictions;
- generate activity recommendations;
- retrieve historical information;
- accept custom future prediction times;
- expose functionality through the REST API;
- provide real information to the mobile application;
- distinguish normal, degraded, and unavailable network conditions.

The system uses three network classifications:

- `OK`
- `RISK`
- `FAILURE`

---

## 2. Automated Test Suite

The backend uses `pytest` as the automated testing framework.

The final regression test was executed from:

```text
services/api
```

using:

```bash
pytest -v
```

Final result:

```text
82 tests collected
82 passed
6 warnings
Execution time: 1.28s
```

Therefore:

```text
Automated tests passed: 82/82
Success rate: 100%
Failed tests: 0
```

The warnings reported during execution are dependency deprecation warnings and do not represent functional failures in the application.

The warnings are mainly related to:

- Starlette `TestClient`;
- deprecated HTTP 422 constants.

These warnings are considered technical debt for future dependency upgrades and do not affect the current functionality of the prototype.

---

## 3. Host Management Tests

The host-management tests validate:

- host creation;
- host listing;
- host retrieval by ID;
- host update;
- IPv4 validation;
- IPv6 validation;
- invalid address rejection;
- duplicate IP rejection;
- nonexistent host handling;
- active and inactive host behavior.

Examples of covered operations:

```text
POST /hosts
GET /hosts
GET /hosts/{id}
PUT /hosts/{id}
```

The automated suite also verifies that invalid IP addresses and duplicated addresses are rejected correctly.

---

## 4. ICMP Monitoring Tests

The ICMP monitoring module validates the execution and interpretation of system ping commands.

The automated tests cover:

- extraction of latency from English ping output;
- extraction of latency from Portuguese ping output;
- missing latency handling;
- successful ICMP measurement;
- partial packet loss;
- total packet loss;
- invalid packet count rejection;
- invalid timeout rejection;
- periodic monitoring;
- invalid periodic interval rejection.

The monitoring service transforms the result of the operating-system ping command into structured data containing information such as:

```text
host
measured_at
latency
packet loss
success
packets sent
packets received
```

---

## 5. Measurement Persistence

The measurement tests validate:

- ICMP measurement execution;
- persistence of measurements;
- retrieval of measurement history;
- newest measurement ordering;
- active host validation;
- inactive host rejection;
- nonexistent host handling.

Each persisted measurement can contain:

```text
host_id
measured_at
latency_ms
packet_loss_pct
success
status
created_at
```

The measurements stored by the system are later used by:

- the History screen;
- the prediction engine;
- the alert system;
- summary calculations.

---

## 6. Measurement History

Historical measurements can be retrieved and filtered by:

- status;
- start date;
- end date;
- maximum result limit.

The automated tests validate:

- valid historical filters;
- status filtering;
- date filtering;
- result limits;
- invalid history periods;
- summary statistics;
- empty historical summaries.

The History screen in the mobile application consumes these measurements to display:

- average latency;
- minimum latency;
- maximum latency;
- average packet loss;
- latency evolution;
- packet-loss evolution;
- recent measurements.

---

## 7. Network Classification

The network classifier supports three states:

```text
OK
RISK
FAILURE
```

The thresholds are project-defined rules used by the prototype.

### 7.1 OK

A measurement is classified as `OK` when the host responds and:

```text
latency < 300 ms
packet loss < 1%
```

The automated suite validates:

- healthy network classification;
- latency immediately below the threshold;
- packet loss immediately below the threshold.

---

### 7.2 RISK

A measurement is classified as `RISK` when the host still responds but degradation indicators are detected.

Examples:

```text
latency >= 300 ms
```

or:

```text
packet loss >= 1%
and
packet loss < 100%
```

The automated suite contains tests including:

```text
test_latency_at_threshold_is_risk
test_latency_above_threshold_is_risk
test_packet_loss_at_threshold_is_risk
test_partial_packet_loss_is_risk
test_missing_latency_with_success_is_risk
test_high_latency_and_packet_loss_is_risk
```

---

### 7.3 FAILURE

A measurement is classified as `FAILURE` when:

```text
the host does not respond
```

or:

```text
packet loss = 100%
```

The automated suite validates:

```text
total packet loss
unsuccessful measurement
```

It also validates invalid values such as:

```text
negative latency
negative packet loss
packet loss above 100%
```

---

## 8. Alert Validation

Alerts are generated according to the network condition.

### OK

```text
Status: OK
Alert: none
```

### RISK

```text
Status: RISK
Alert severity: warning
```

Automated validation includes:

```text
test_risk_measurement_generates_warning_alert
```

### FAILURE

```text
Status: FAILURE
Alert severity: critical
```

Automated validation includes:

```text
test_failure_measurement_generates_critical_alert
```

The suite also validates:

- alert references to generated measurements;
- alert retrieval;
- behavior for nonexistent hosts.

---

## 9. Prediction Engine Testing

The prediction engine uses recent historical measurements to estimate future connectivity conditions.

The current implementation is a statistical baseline based on recent measurements and linear trend estimation.

It is not presented as a machine-learning model.

The prediction process may generate:

```text
predicted_latency_ms
predicted_packet_loss_pct
predicted_status
forecast_for
confidence
```

At the current project stage:

```text
confidence = null
```

No statistically defensible confidence metric has been implemented yet.

The automated tests validate:

- increasing latency trends;
- predicted `OK`;
- predicted `RISK`;
- predicted `FAILURE`;
- packet-loss prediction;
- packet-loss clamping to 0%;
- packet-loss clamping to 100%;
- minimum historical measurement requirements;
- future prediction timestamps.

The prediction engine requires at least three historical measurements.

---

## 10. Future-Time Prediction

The API allows the client to select a custom future timestamp.

Endpoint:

```text
POST /hosts/{host_id}/predictions/forecast
```

Example:

```json
{
  "forecast_for": "2026-09-04T03:16:00-03:00"
}
```

The automated tests validate:

- valid future timestamps;
- rejection of timestamps in the past;
- mandatory timezone information;
- invalid prediction periods.

The mobile Forecast screen uses this functionality to allow the user to select a future date and time.

---

## 11. Prediction History

Generated predictions are persisted and can be retrieved later.

The automated tests validate:

- prediction history retrieval;
- latest prediction retrieval;
- optional historical filters;
- nonexistent host behavior;
- empty latest-prediction behavior.

Main endpoints include:

```text
GET /hosts/{host_id}/predictions
GET /hosts/{host_id}/predictions/latest
```

---

## 12. Activity Recommendation Testing

Predictions are converted into recommendations for common network activities.

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

### OK Prediction

All supported activities are classified as:

```text
RECOMMENDED
```

### RISK Prediction

Web browsing remains:

```text
RECOMMENDED
```

while more connectivity-sensitive activities are classified as:

```text
CAUTION
```

Automated validation includes:

```text
test_risk_network_generates_caution
```

### FAILURE Prediction

All supported activities are classified as:

```text
NOT_RECOMMENDED
```

The tests also validate:

- supported activity list;
- recommendation messages;
- prediction ownership;
- nonexistent predictions;
- nonexistent hosts.

---

## 13. Controlled RISK Validation

The `RISK` state was validated using controlled and reproducible automated tests rather than depending on unpredictable real-world network degradation.

The focused validation executed the following scenarios:

```text
Latency at the configured threshold
Partial packet loss
Warning alert generation
RISK prediction generation
CAUTION recommendation generation
```

The focused command executed was:

```bash
pytest -v tests/test_network_classifier.py::test_latency_at_threshold_is_risk tests/test_network_classifier.py::test_partial_packet_loss_is_risk tests/test_alerts.py::test_risk_measurement_generates_warning_alert tests/test_prediction_service.py::test_calculate_prediction_detects_risk tests/test_recommendation_service.py::test_risk_network_generates_caution
```

Result:

```text
5 tests collected
5 passed
```

This validates the logical chain:

```text
High latency or partial packet loss
        ↓
RISK
        ↓
WARNING alert
        ↓
RISK prediction
        ↓
CAUTION recommendation
```

This scenario is explicitly considered a controlled validation scenario and not a claim of naturally occurring network degradation.

---

## 14. Real OK Scenario

A real ICMP test was performed using the monitored host:

```text
Name: Google DNS
IP: 8.8.8.8
```

The host successfully responded to real ICMP requests.

Observed behavior:

```text
success = true
packet loss = 0%
latency below 300 ms
status = OK
```

This validated the real execution chain:

```text
ICMP Echo
    ↓
Measurement
    ↓
Persistence
    ↓
Classifier
    ↓
OK
```

Multiple measurements were generated and stored successfully.

---

## 15. Real FAILURE Scenario

A controlled unreachable host was registered using:

```text
192.0.2.1
```

The host was used to validate failure detection.

The host did not successfully respond to the ICMP measurement.

Observed behavior:

```text
success = false
packet loss = 100%
status = FAILURE
```

The system also generated a:

```text
CRITICAL alert
```

This validates the complete chain:

```text
Unreachable host
        ↓
ICMP failure
        ↓
100% packet loss
        ↓
FAILURE
        ↓
CRITICAL alert
```

---

## 16. Prediction Versus Real Measurement

A prediction-versus-observed-result validation was performed using:

```text
Host: Google DNS
IP: 8.8.8.8
```

A prediction was generated at approximately:

```text
03:12
```

for the future timestamp:

```text
03:16
```

### Predicted Result

```text
Predicted latency: 8.13 ms
Predicted packet loss: 0%
Predicted status: OK
```

### Real Measurement

A new real ICMP measurement was performed at approximately:

```text
03:16:16
```

Observed result:

```text
Measured latency: 5.00 ms
Measured packet loss: 0%
Measured status: OK
```

### Comparison

| Metric | Predicted | Observed |
| --- | ---: | ---: |
| Latency | 8.13 ms | 5.00 ms |
| Packet loss | 0% | 0% |
| Network status | OK | OK |

Absolute latency difference:

```text
3.13 ms
```

Packet-loss prediction:

```text
Correct
```

Network-condition prediction:

```text
Correct
```

The experiment demonstrates that the prediction pipeline is operational from historical measurements through future estimation and subsequent comparison with a later real measurement.

A single observation is not sufficient to establish global statistical accuracy.

Additional measurements across longer periods and different network conditions would be required to estimate prediction accuracy reliably.

---

## 17. Cisco Packet Tracer Validation

Cisco Packet Tracer was used to demonstrate the network behavior underlying ICMP monitoring.

The final topology contains:

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

### Monitoring Network

```text
Network: 192.168.10.0/24

PC-Monitor:
IP: 192.168.10.10
Gateway: 192.168.10.1
```

### Router

```text
R1

GigabitEthernet0/0:
192.168.10.1/24

GigabitEthernet0/1:
192.168.20.1/24
```

### Monitored Network

```text
Network: 192.168.20.0/24

Server-Target:
IP: 192.168.20.10
Gateway: 192.168.20.1
```

---

## 18. Packet Tracer — Normal Operation

Connectivity was tested between:

```text
PC-Monitor
192.168.10.10
```

and:

```text
Server-Target
192.168.20.10
```

After address-resolution convergence, the normal scenario produced:

```text
Packets sent: 4
Packets received: 4
Packets lost: 0
Packet loss: 0%
```

ICMP Echo Request and Echo Reply were also observed through Packet Tracer Simulation Mode.

The packet path was:

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

The Echo Reply returned through the reverse path.

---

## 19. Packet Tracer — Failure Scenario

A connectivity failure was intentionally created by administratively disabling:

```text
R1 GigabitEthernet0/1
```

Command:

```text
shutdown
```

The interface state was confirmed as:

```text
administratively down
down
```

The monitored network became unreachable.

The resulting ICMP test produced:

```text
Packets sent: 4
Packets received: 0
Packets lost: 4
Packet loss: 100%
```

The output also included:

```text
Destination host unreachable
```

Simulation Mode demonstrated the packet reaching the router but failing to continue toward the monitored network.

This scenario represents the network-level behavior associated with the application's `FAILURE` condition.

---

## 20. Packet Tracer — Recovery Scenario

The router interface was restored using:

```text
no shutdown
```

The link returned to its operational state.

During recovery, the observed packet-loss sequence included:

```text
100% loss
25% loss
0% loss
```

The final test produced:

```text
Packets sent: 4
Packets received: 4
Packets lost: 0
Packet loss: 0%
```

The Packet Tracer project was saved in its final functional state with the network operational.

---

## 21. Real Environment Versus Simulated Environment

The project intentionally separates the real monitoring environment from Cisco Packet Tracer simulation.

### Real Environment

The functional prototype uses:

```text
Operating-system ICMP ping
        ↓
Python
        ↓
FastAPI
        ↓
PostgreSQL
        ↓
Prediction engine
        ↓
Recommendation engine
        ↓
React Native / Expo
```

Real hosts are monitored using ICMP requests executed by the backend.

---

### Simulated Environment

Cisco Packet Tracer demonstrates:

```text
network topology
IPv4 addressing
subnets
default gateways
Layer 2 switching
Layer 3 routing
ICMP Echo Request
ICMP Echo Reply
interface failure
connectivity failure
network recovery
```

Packet Tracer does not directly feed data into the FastAPI backend.

It serves as an educational and technical representation of the network behavior that the real application monitors.

---

## 22. Mobile Application Validation

The React Native / Expo application was tested using a physical Android device.

The application successfully consumed the FastAPI backend over the local network.

The validated screens are:

```text
Overview
History
Forecast
Alerts
```

---

## 23. Overview Validation

The Overview screen was validated with real API data.

Validated functionality:

```text
latest real measurement
current network status
latest prediction
real latency
real packet loss
pull-to-refresh
automatic reload when returning to the screen
OK visual state
RISK visual state
FAILURE visual state
```

A manual refresh test was also performed.

A new ICMP measurement was generated through Swagger, after which the Overview screen was refreshed.

The newly measured latency appeared correctly in the mobile interface.

This confirmed:

```text
Swagger
    ↓
FastAPI
    ↓
PostgreSQL
    ↓
React Native
    ↓
Updated mobile data
```

---

## 24. History Validation

The History screen was connected to real historical measurements.

Validated functionality:

```text
24-hour filter
7-day filter
30-day filter
average latency
minimum latency
maximum latency
average packet loss
latency chart
packet-loss chart
recent measurement list
pull-to-refresh
```

All displayed values originate from real API measurements.

---

## 25. Forecast Validation

The Forecast screen allows the user to choose:

```text
future date
future time
```

The selected timestamp is sent to:

```text
POST /hosts/{host_id}/predictions/forecast
```

Validated output includes:

```text
predicted latency
predicted packet loss
predicted status
activity recommendations
```

The interface also presents recommendations for:

```text
videoconference
streaming
online gaming
web browsing
file upload
```

---

## 26. Alerts Validation

The Alerts screen was connected to the real API.

Validated functionality:

```text
empty alert state
warning alert state
critical alert state
alert summary
recent alerts
pull-to-refresh
```

Temporary development alerts were created to validate the visual states and were removed after testing.

This confirmed the complete flow:

```text
PostgreSQL
    ↓
FastAPI
    ↓
Alerts endpoint
    ↓
React Native
    ↓
Alert cards
```

---

## 27. Internationalization Validation

The mobile application supports three languages:

```text
English
Portuguese
Spanish
```

Language preference is persisted using local storage.

The following interface elements were validated in all supported languages:

```text
navigation
status labels
measurements
history
forecast
alerts
activity names
recommendation states
recommendation descriptions
```

An explicit language-selection modal was implemented to improve usability and accessibility.

---

## 28. Accessibility Validation

The mobile interface was designed according to the accessibility requirements established for the project.

Validated characteristics include:

```text
minimum 48 dp touch targets
screen-reader accessibility labels
status information not represented only by color
explicit OK / RISK / FAILURE text
explicit recommendation suitability text
font scaling
scrollable content
predictable bottom-tab navigation
safe-area handling
accessible language selection
```

Large system font sizes were manually tested on a physical Android device.

The application remained navigable and the content remained accessible.

---

## 29. End-to-End Architecture Validation

The project was successfully validated end-to-end.

The real system flow is:

```text
Network Host
    ↓
ICMP Echo Request / Reply
    ↓
ICMP Monitor
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

The mobile application displays information generated from the real monitoring pipeline rather than static mock data.

---

## 30. Final Test Status

### Automated Backend Tests

```text
82 passed
0 failed
6 warnings
```

### Functional and Integration Validation

```text
Real OK scenario                         PASSED
Controlled RISK scenario                 PASSED
Real FAILURE scenario                    PASSED
Warning alert                            PASSED
Critical alert                           PASSED
Prediction generation                    PASSED
Prediction vs real measurement           PASSED
Activity recommendations                 PASSED
Mobile API integration                   PASSED
Overview real data                       PASSED
Overview pull-to-refresh                 PASSED
History visualization                    PASSED
History filters                          PASSED
Forecast interface                       PASSED
Future date/time selection               PASSED
Alerts interface                         PASSED
Internationalization                     PASSED
Large-font accessibility                 PASSED
Status without color dependency          PASSED
Minimum touch-target validation          PASSED
Packet Tracer normal operation           PASSED
Packet Tracer failure scenario           PASSED
Packet Tracer recovery                   PASSED
```

---

## 31. Conclusion

The testing strategy combines:

- automated unit tests;
- automated integration tests;
- real ICMP measurements;
- controlled degradation scenarios;
- real connectivity-failure tests;
- prediction validation;
- activity-recommendation validation;
- mobile integration testing;
- internationalization testing;
- accessibility validation;
- Cisco Packet Tracer simulation.

The final automated regression suite completed successfully with:

```text
82/82 tests passing
```

The system was also validated through real and controlled scenarios representing:

```text
normal operation
degraded network condition
connectivity failure
network recovery
future connectivity prediction
```

The results demonstrate that the current prototype satisfies the core functional objectives of the ICMP Network Failure Predictor.

Future work may include:

- longer prediction-validation periods;
- additional monitored hosts;
- more advanced statistical or machine-learning models;
- a formal confidence metric;
- production deployment;
- continuous monitoring infrastructure;
- expanded network analytics.
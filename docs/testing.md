# Testing Strategy

This document defines the initial testing strategy for the ICMP Network Failure Predictor.

Testing will be performed throughout development to verify network monitoring, data storage, classification, predictions, API behavior, mobile functionality and accessibility requirements.

---

## 1. Testing Objectives

The testing process aims to verify that:

- monitored hosts can be reached and measured correctly
- ICMP measurements are recorded correctly
- unavailable hosts are handled safely
- historical measurements are stored consistently
- network status classification behaves as expected
- prediction results can be compared with real network behavior
- REST API endpoints return valid responses
- the mobile application correctly consumes API data
- accessibility requirements are respected
- simulated and real network scenarios can be compared

---

## 2. Main Validation Scenarios

The project must be tested under at least three main connectivity scenarios.

### Scenario A — Normal Network

The monitored host responds normally to ICMP requests.

Expected behavior:

- host responds successfully
- latency measurement is recorded
- packet-loss information is recorded
- measurement timestamp is stored
- host availability is recorded
- network status is classified as a healthy condition when the configured rules are satisfied

Expected user-facing behavior:

- the application indicates that the connection is operating normally
- information is displayed using text and accessible visual indicators

---

### Scenario B — Unstable Network

The network presents signs of degradation.

Possible indicators may include:

- increased latency
- increased packet loss
- irregular response times
- intermittent failures
- increased jitter

Expected behavior:

- measurements continue to be recorded
- degraded network behavior is identified
- historical information remains available
- the classification engine indicates a risk condition when the configured rules are satisfied

Expected user-facing behavior:

- the application warns the user about possible instability
- the warning must not rely only on color
- the user receives understandable information about the network condition

---

### Scenario C — Unavailable Host

The monitored host does not respond to ICMP requests.

Expected behavior:

- the failed monitoring attempt is recorded
- the application does not crash
- the host is marked as unavailable for that measurement
- the monitoring timestamp is preserved
- the classification engine can identify a failure condition according to the configured rules

Expected user-facing behavior:

- the application clearly informs the user that the host or connection is unavailable
- the information is communicated through text and accessible indicators

---

## 3. ICMP Monitoring Tests

The monitoring service should be tested for the following situations:

- successful ICMP response
- no ICMP response
- multiple consecutive measurements
- latency measurement
- packet-loss calculation
- unreachable host
- invalid host address
- intermittent connectivity

For every monitoring attempt, verify that the expected measurement information is produced.

---

## 4. Data Persistence Tests

Database tests should verify that:

- hosts can be stored
- measurements can be stored
- each measurement is associated with the correct host
- timestamps are preserved
- latency values are stored correctly
- packet-loss values are stored correctly
- availability information is stored correctly
- historical measurements can be retrieved
- prediction records can be persisted when prediction functionality is implemented
- alert records can be persisted when alert functionality is implemented

---

## 5. Classification Tests

The classification engine will be tested after the classification thresholds are formally defined.

Planned technical states:

- `OK`
- `RISK`
- `FAILURE`

Tests must verify that measurements are classified according to the documented rules.

Important:

Exact latency, packet-loss, jitter and availability thresholds have not yet been defined.

They must be documented before classification tests are considered complete.

---

## 6. Prediction Validation

Prediction results should be compared with actual observed network conditions.

Basic validation flow:

1. Historical measurements are collected.
2. A prediction is generated for a future period.
3. The predicted status is stored.
4. Real measurements are collected during the predicted period.
5. The prediction is compared with the observed network condition.
6. The result is documented.

Example:

Predicted condition:

`RISK`

Observed condition:

`RISK`

Result:

Prediction matched the observed network condition.

Another possible result:

Predicted condition:

`OK`

Observed condition:

`RISK`

Result:

Prediction did not match the observed network condition.

Prediction accuracy metrics may be introduced later if required by the final implementation.

---

## 7. REST API Tests

The REST API should be tested for:

- successful responses
- invalid requests
- missing resources
- invalid host identifiers
- malformed input
- database failures
- expected response structure
- expected HTTP status codes

Planned resource areas include:

- hosts
- measurements
- historical data
- network status
- predictions
- alerts
- activity recommendations

Automated API tests may be implemented using `pytest`.

---

## 8. Mobile Application Tests

The mobile application should be tested for:

- application startup
- navigation between screens
- API connection
- loading states
- successful data display
- empty-data scenarios
- API failure scenarios
- current network-status visualization
- historical-data visualization
- future prediction visualization
- activity recommendation flow
- date and time selection

---

## 9. Accessibility Tests

Accessibility must be tested as part of the normal development process.

The application should be checked for:

- TalkBack compatibility
- VoiceOver compatibility when available
- accessible labels
- logical focus order
- text scaling
- adequate contrast
- adequate touch-target size
- information not communicated only through color
- understandable language
- accessible explanations for technical terms

Main application flows should remain usable with assistive technologies.

---

## 10. Activity Recommendation Tests

The system should be tested with different activity types.

Examples:

- video calls
- audio calls
- streaming
- online gaming
- web browsing
- file transfers
- messaging

For each activity, the system should evaluate the predicted network condition and return an understandable recommendation.

Example test:

Activity:

`Video Call`

Predicted condition:

`OK`

Expected result:

The application indicates that the connection is expected to be suitable for the activity.

Another example:

Activity:

`Online Gaming`

Predicted condition:

`RISK`

Expected result:

The application warns that the connection may present instability during the selected period.

---

## 11. Packet Tracer Validation

Cisco Packet Tracer will be used to create simulated network scenarios.

Tests should compare simulated and real environments when applicable.

The comparison should document:

- network topology
- devices used
- protocols involved
- ICMP behavior
- simulated connectivity condition
- real monitoring condition
- similarities
- differences
- conclusions

Detailed simulation documentation will be maintained in:

`docs/network-simulation.md`

---

## 12. Manual Test Case Template

Manual test cases should follow a consistent format.

### Test Case ID

Example:

`TC-001`

### Requirement

Example:

`FR02`

### Title

Example:

Successful ICMP measurement

### Preconditions

- monitored host is registered
- monitored host is online
- network connection is available

### Steps

1. Start the monitoring service.
2. Execute an ICMP measurement.
3. Wait for the response.
4. Inspect the generated measurement.

### Expected Result

- host responds successfully
- latency is measured
- timestamp is recorded
- measurement is stored correctly

### Actual Result

To be completed during testing.

### Status

Possible values:

- `PASS`
- `FAIL`
- `BLOCKED`

---

## 13. Initial Test Cases

### TC-001 — Normal Host Response

Requirement:

`FR02 / FR03`

Expected result:

The host responds and a valid network measurement is created.

---

### TC-002 — Unreachable Host

Requirement:

`FR02 / FR03 / FR04`

Expected result:

The failed response is recorded without crashing the monitoring service.

---

### TC-003 — Network Degradation

Requirement:

`FR03 / FR04`

Expected result:

Degraded measurements are recorded and classified according to the configured rules.

---

### TC-004 — Historical Data Retrieval

Requirement:

`FR05`

Expected result:

Stored measurements can be retrieved in chronological order.

---

### TC-005 — Future Prediction Consultation

Requirement:

`FR07`

Expected result:

The user can retrieve a prediction for a future period when prediction data is available.

---

### TC-006 — Activity Recommendation

Requirement:

`FR09`

Expected result:

The system provides an understandable recommendation based on the expected network condition.

---

### TC-007 — Accessible Network Status

Expected result:

Network status is communicated using text and accessible elements rather than color alone.

---

### TC-008 — Text Scaling

Expected result:

Increasing the operating-system font size does not hide or prevent access to essential functionality.

---

## 14. Test Evidence

Testing evidence may include:

- terminal output
- API responses
- database queries
- application screenshots
- screen recordings
- Packet Tracer screenshots
- automated test results
- comparison tables

Evidence should be stored or referenced in the repository when appropriate.

Screenshots may be stored in:

`assets/screenshots/`

---

## 15. Test Status

Current phase:

**Testing strategy defined**

Most test cases are currently planned and will be executed as the corresponding features are implemented.

Test results must not be marked as completed before the related functionality exists.

## Network Classification Tests

The network classification service is validated through automated unit and integration tests.

The current classification policy is:

| Condition | Result |
| --- | --- |
| Host responds, RTT < 300 ms and packet loss < 1% | `OK` |
| Host responds, but RTT >= 300 ms or packet loss >= 1% | `RISK` |
| Host does not respond or packet loss reaches 100% | `FAILURE` |

Boundary testing is included to verify the exact transition points between states.

Examples:

- 299.9 ms latency → `OK`
- 300.0 ms latency → `RISK`
- 0.99% packet loss → `OK`
- 1.00% packet loss → `RISK`
- 100% packet loss → `FAILURE`

Additional validation covers:

- negative latency rejection;
- packet loss below 0% rejection;
- packet loss above 100% rejection;
- missing latency with successful response;
- partial packet loss;
- total packet loss;
- simultaneous high latency and packet loss.

The measurement persistence tests also verify that classifications are stored in PostgreSQL and returned through the REST API.

Current automated test suite status:

`40 passed`

## Historical Analysis and Alert Tests

FR05 includes automated tests for:

- history retrieval by host;
- status filtering;
- date and time filtering;
- result limits;
- invalid period validation;
- historical summary statistics;
- empty history summaries;
- healthy measurements without alerts;
- warning alerts for `RISK`;
- critical alerts for `FAILURE`;
- alert-to-measurement relationships;
- nonexistent host handling.

Historical and alert behavior is tested using controlled ICMP measurements rather than external network dependencies.

## Prediction Engine Tests

The prediction engine is validated through unit and integration tests.

Current coverage includes:

- increasing latency trends;
- healthy network prediction;
- degraded network prediction;
- failure prediction;
- packet loss lower-bound protection;
- packet loss upper-bound protection;
- insufficient historical data;
- prediction API response;
- future forecast timestamps;
- prediction persistence;
- nonexistent host handling.

External network connectivity is not required for prediction tests because controlled historical measurements are used.

The prediction tests validate the statistical baseline independently from the ICMP collection layer.
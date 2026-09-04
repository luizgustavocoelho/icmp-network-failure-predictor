# Network Classification

## ICMP Network Failure Predictor

This document describes the network classification policy used by the ICMP Network Failure Predictor.

The system classifies each network measurement into one of three states:

```text
OK
RISK
FAILURE
```

These states are used consistently across:

- real ICMP measurements;
- historical records;
- alerts;
- predictions;
- activity recommendations;
- mobile visualization.

---

## 1. Classification Objective

Raw ICMP results such as:

```text
latency
packet loss
success
```

are useful technically, but they are not always immediately meaningful to non-specialist users.

The classification layer converts those measurements into a simpler network condition.

Conceptually:

```text
ICMP Result
    ↓
Latency
Packet Loss
Success
    ↓
Network Classifier
    ↓
OK / RISK / FAILURE
```

This makes the system easier to interpret while preserving the underlying technical values.

---

## 2. Supported States

The classifier supports exactly three internal states:

```text
OK
RISK
FAILURE
```

These values are reused by both real measurements and predicted network conditions.

---

## 3. Important Scope Note

The thresholds documented here are:

```text
project-defined prototype rules
```

They are not presented as universal standards for all networks, applications, providers, or environments.

Real network-quality requirements vary depending on factors such as:

```text
application type
network technology
geographic distance
service-level objective
provider
traffic pattern
user expectation
```

The thresholds were selected to provide consistent and testable behavior for the academic prototype.

---

## 4. Classification Inputs

The classifier primarily evaluates:

```text
success
latency_ms
packet_loss_pct
```

Each measurement can therefore be interpreted based on:

```text
Did the host respond?

How long did the response take?

How many packets were lost?
```

---

# OK

## 5. OK Definition

A network measurement is classified as:

```text
OK
```

when the monitored host responds successfully and both quality indicators remain below the configured degradation thresholds.

Rule:

```text
success = true
AND
latency < 300 ms
AND
packet loss < 1%
```

---

## 6. OK Examples

### Example 1

```text
success = true
latency = 5 ms
packet loss = 0%
```

Result:

```text
OK
```

### Example 2

```text
success = true
latency = 120 ms
packet loss = 0%
```

Result:

```text
OK
```

### Example 3

```text
success = true
latency = 299 ms
packet loss = 0.5%
```

Result:

```text
OK
```

---

## 7. OK Meaning

The `OK` state indicates that the prototype did not detect a significant connectivity issue according to its configured rules.

In the mobile interface, this may be presented using text such as:

```text
Network is stable
```

The interface also displays the actual latency and packet-loss values.

---

# RISK

## 8. RISK Definition

A network measurement is classified as:

```text
RISK
```

when the host still responds, but at least one degradation indicator reaches or exceeds the configured threshold.

The main rules are:

```text
success = true
AND
latency >= 300 ms
```

or:

```text
success = true
AND
packet loss >= 1%
AND
packet loss < 100%
```

A successful response with unavailable latency information can also be treated conservatively as:

```text
RISK
```

---

## 9. Latency RISK Example

Input:

```text
success = true
latency = 300 ms
packet loss = 0%
```

Result:

```text
RISK
```

The value:

```text
300 ms
```

is included in the risk range.

---

## 10. High-Latency Example

Input:

```text
success = true
latency = 450 ms
packet loss = 0%
```

Result:

```text
RISK
```

The host remains reachable, but response time is considered degraded by the prototype policy.

---

## 11. Packet-Loss RISK Example

Input:

```text
success = true
latency = 50 ms
packet loss = 5%
```

Result:

```text
RISK
```

Even though latency is low, partial packet loss indicates degraded communication.

---

## 12. Threshold Packet-Loss Example

Input:

```text
success = true
latency = 50 ms
packet loss = 1%
```

Result:

```text
RISK
```

The value:

```text
1%
```

belongs to the risk range.

---

## 13. Multiple Degradation Indicators

Input:

```text
success = true
latency = 380 ms
packet loss = 10%
```

Result:

```text
RISK
```

Both quality indicators show degradation, but communication has not completely failed.

---

## 14. Missing Latency with Successful Response

A successful measurement where latency is unexpectedly unavailable is treated conservatively.

Example:

```text
success = true
latency = null
packet loss < 100%
```

Result:

```text
RISK
```

This avoids presenting incomplete measurement information as unquestionably healthy.

---

## 15. RISK Meaning

The `RISK` state means:

```text
the destination is still reachable,
but network quality shows degradation
```

It does not mean that the network has completely failed.

In the mobile interface, this may be displayed as:

```text
Network degradation detected
```

---

# FAILURE

## 16. FAILURE Definition

A measurement is classified as:

```text
FAILURE
```

when communication with the monitored host is unavailable.

Main conditions:

```text
success = false
```

or:

```text
packet loss = 100%
```

---

## 17. FAILURE Example — No Response

Input:

```text
success = false
latency = null
packet loss = 100%
```

Result:

```text
FAILURE
```

---

## 18. FAILURE Example — Total Packet Loss

Input:

```text
success = false
packet loss = 100%
```

Result:

```text
FAILURE
```

This indicates complete loss of successful ICMP communication during the measurement.

---

## 19. FAILURE Meaning

The `FAILURE` state indicates that the monitored host could not be considered reachable through the performed ICMP measurement.

The mobile application may present this as:

```text
Network unavailable
```

The exact technical cause may require additional investigation.

Possible causes can include:

```text
host outage
network interruption
routing problem
interface failure
firewall policy
ICMP filtering
```

The classifier identifies the observed ICMP result.

It does not automatically determine the root cause of the failure.

---

# CLASSIFICATION ORDER

## 20. Decision Priority

Classification follows a logical priority.

Conceptually:

```text
Is the host unreachable
or is packet loss 100%?
        │
        ├── Yes → FAILURE
        │
        └── No
              ↓
Is latency >= 300 ms
or packet loss >= 1%
or latency unexpectedly unavailable?
        │
        ├── Yes → RISK
        │
        └── No → OK
```

This ensures that complete communication failure takes precedence over degraded conditions.

---

## 21. Decision Table

| Success | Latency | Packet Loss | Classification |
| --- | ---: | ---: | --- |
| true | 5 ms | 0% | OK |
| true | 299 ms | 0% | OK |
| true | 300 ms | 0% | RISK |
| true | 450 ms | 0% | RISK |
| true | 50 ms | 1% | RISK |
| true | 50 ms | 5% | RISK |
| true | null | partial / valid | RISK |
| false | null | 100% | FAILURE |
| false | any valid value | 100% | FAILURE |

---

# DATA VALIDATION

## 22. Invalid Latency

Negative latency values are invalid.

Example:

```text
latency = -10 ms
```

This must not be treated as a valid network measurement.

The automated test suite validates rejection of invalid latency data.

---

## 23. Invalid Packet Loss

Packet loss must remain inside:

```text
0% to 100%
```

Invalid examples:

```text
-1%
101%
```

These values must not be accepted as valid classification input.

---

# ALERT RELATIONSHIP

## 24. Classification and Alerts

Classification affects alert generation.

Relationship:

```text
OK
    ↓
No alert
```

```text
RISK
    ↓
WARNING alert
```

```text
FAILURE
    ↓
CRITICAL alert
```

This makes alert severity consistent with the measured network state.

---

## 25. OK Alert Policy

For:

```text
OK
```

the system does not generate a degradation or failure alert.

This avoids unnecessary notifications for healthy measurements.

---

## 26. RISK Alert Policy

For:

```text
RISK
```

the system generates:

```text
warning
```

severity.

The purpose is to indicate that communication still exists but quality has degraded.

---

## 27. FAILURE Alert Policy

For:

```text
FAILURE
```

the system generates:

```text
critical
```

severity.

This represents loss of successful communication with the monitored destination.

---

# PREDICTION RELATIONSHIP

## 28. Classifier Reuse

The same classification logic is reused for prediction output.

Conceptually:

```text
Predicted Latency
Predicted Packet Loss
        ↓
Network Classifier
        ↓
Predicted Status
```

Result:

```text
OK
RISK
FAILURE
```

This provides consistency between:

```text
current network condition
```

and:

```text
future predicted network condition
```

---

## 29. Why Reuse the Same Classifier?

Using the same classification rules avoids situations where:

```text
5% packet loss
```

could mean one status for a real measurement and a different status for a prediction.

The policy therefore remains consistent across the entire system.

---

# RECOMMENDATION RELATIONSHIP

## 30. Classification and Recommendations

Predicted status is converted into user-oriented recommendations.

### OK

```text
RECOMMENDED
```

for all supported activities.

### RISK

Most connectivity-sensitive activities become:

```text
CAUTION
```

while web browsing remains:

```text
RECOMMENDED
```

### FAILURE

All supported activities become:

```text
NOT_RECOMMENDED
```

---

## 31. Recommendation Matrix

| Activity | OK | RISK | FAILURE |
| --- | --- | --- | --- |
| Videoconference | RECOMMENDED | CAUTION | NOT_RECOMMENDED |
| Streaming | RECOMMENDED | CAUTION | NOT_RECOMMENDED |
| Online gaming | RECOMMENDED | CAUTION | NOT_RECOMMENDED |
| Web browsing | RECOMMENDED | RECOMMENDED | NOT_RECOMMENDED |
| File upload | RECOMMENDED | CAUTION | NOT_RECOMMENDED |

---

# MOBILE PRESENTATION

## 32. User-Facing Representation

The mobile application presents classification using:

```text
text
color
descriptive message
```

Color is only a supporting indicator.

The application does not require the user to identify status based only on color.

---

## 33. OK Presentation

Conceptually:

```text
OK

Network is stable

No significant connectivity issues were
detected in the latest measurement.
```

---

## 34. RISK Presentation

Conceptually:

```text
RISK

Network degradation detected

The latest measurement indicates network
degradation that may affect some activities.
```

---

## 35. FAILURE Presentation

Conceptually:

```text
FAILURE

Network unavailable

The monitored host is unavailable or
experiencing total packet loss.
```

---

# INTERNATIONALIZATION

## 36. Internal and User-Facing Status

Internally, the system retains:

```text
OK
RISK
FAILURE
```

The mobile application translates user-facing labels.

### English

```text
OK
RISK
FAILURE
```

### Portuguese

```text
OK
RISCO
FALHA
```

### Spanish

```text
OK
RIESGO
FALLA
```

The internal data model remains consistent regardless of interface language.

---

# VALIDATION

## 37. Automated Classification Testing

The classification policy is covered by automated tests.

Examples include:

```text
test_healthy_network_is_ok
test_latency_below_threshold_is_ok
test_latency_at_threshold_is_risk
test_latency_above_threshold_is_risk
test_packet_loss_below_threshold_is_ok
test_packet_loss_at_threshold_is_risk
test_partial_packet_loss_is_risk
test_missing_latency_with_success_is_risk
test_high_latency_and_packet_loss_is_risk
```

Failure conditions and invalid values are also covered.

---

## 38. Controlled RISK Validation

The `RISK` state was intentionally validated using controlled automated tests.

This was done because naturally reproducing:

```text
latency >= 300 ms
```

or:

```text
partial packet loss
```

at an exact moment over a real public network would not be deterministic.

The validation included:

```text
RISK classification
WARNING alert
RISK prediction
CAUTION recommendation
```

Result:

```text
PASSED
```

---

## 39. Real OK Validation

A real measurement was executed against:

```text
Google DNS
8.8.8.8
```

Observed result:

```text
host responded
packet loss = 0%
latency below threshold
status = OK
```

Result:

```text
PASSED
```

---

## 40. Real FAILURE Validation

A controlled unreachable host was used.

Observed result:

```text
success = false
packet loss = 100%
status = FAILURE
```

The system also generated:

```text
CRITICAL alert
```

Result:

```text
PASSED
```

---

## 41. Prediction Validation

The classifier was also validated as part of the prediction pipeline.

A real prediction experiment produced:

```text
Predicted status:
OK
```

The subsequent real measurement produced:

```text
Observed status:
OK
```

The predicted classification therefore matched the observed classification in that validation example.

A single prediction example is not sufficient to establish global prediction accuracy.

---

# PACKET TRACER RELATIONSHIP

## 42. Network Failure Simulation

Cisco Packet Tracer was used to demonstrate a physical/logical network condition associated with failure.

The interface:

```text
R1 GigabitEthernet0/1
```

was administratively disabled.

The resulting test showed:

```text
Destination host unreachable
100% packet loss
```

This network behavior corresponds conceptually to:

```text
FAILURE
```

in the real application.

---

## 43. Network Recovery Simulation

After:

```text
no shutdown
```

the network recovered.

The final stable connectivity test produced:

```text
0% packet loss
```

This demonstrates how an unavailable condition can return to a healthy operational state.

---

# DESIGN PRINCIPLES

## 44. Classification Principles

The classifier follows these practical principles:

```text
Keep the number of states simple.

Keep rules deterministic.

Make thresholds testable.

Treat total loss as failure.

Distinguish degradation from complete failure.

Reuse rules for measurement and prediction.

Expose technical metrics alongside simplified status.

Never claim that prototype thresholds are universal standards.

Do not confuse symptom classification with root-cause diagnosis.
```

---

## 45. Why Only Three States?

The prototype intentionally uses:

```text
OK
RISK
FAILURE
```

instead of a larger number of categories.

This reduces cognitive complexity while still distinguishing:

```text
healthy
degraded
unavailable
```

network behavior.

Future versions could introduce more granular severity levels if supported by validated operational requirements.

---

# LIMITATIONS

## 46. ICMP Limitations

ICMP behavior alone cannot describe every aspect of application quality.

For example, the current classifier does not directly measure:

```text
bandwidth
jitter
TCP retransmissions
DNS response quality
HTTP response time
application server processing
Wi-Fi signal strength
```

The classification therefore represents the condition observed through the current ICMP measurement model.

---

## 47. ICMP Filtering

A host may block ICMP while still providing another service.

In that case:

```text
ICMP failure
```

does not necessarily mean:

```text
every service on the host is unavailable
```

The application specifically monitors ICMP reachability and related measurements.

This distinction should be preserved when interpreting results.

---

## 48. Threshold Limitations

The current:

```text
300 ms latency
1% packet loss
100% packet loss
```

boundaries are prototype policy.

Future versions may make thresholds:

```text
configurable by environment
configurable by host
configurable by activity
based on service-level objectives
derived statistically from historical baselines
```

---

# FUTURE EVOLUTION

## 49. Possible Future Classification Improvements

Future versions could include:

```text
jitter
bandwidth
moving averages
rolling baselines
service-specific thresholds
adaptive thresholds
trend severity
consecutive-failure requirements
time-window aggregation
host-specific profiles
network-type profiles
machine-learning anomaly detection
```

These enhancements would require additional validation before replacing the current deterministic policy.

---

## 50. Final Classification Summary

```text
                    ICMP MEASUREMENT

                           ↓

             Host unavailable / 100% loss?
                     ┌─────┴─────┐
                   YES           NO
                    ↓             ↓
                FAILURE      Latency >= 300 ms
                             OR loss >= 1%
                             OR missing latency?
                              ┌────┴────┐
                            YES        NO
                             ↓          ↓
                           RISK         OK
```

Alert relationship:

```text
OK
→ No alert

RISK
→ WARNING

FAILURE
→ CRITICAL
```

Recommendation relationship:

```text
OK
→ RECOMMENDED

RISK
→ CAUTION / RECOMMENDED depending on activity

FAILURE
→ NOT_RECOMMENDED
```

---

## 51. Final Status

The classification architecture has been implemented and validated for:

```text
OK                                   ✅
RISK                                 ✅
FAILURE                              ✅
Latency threshold                    ✅
Packet-loss threshold                ✅
Total packet loss                    ✅
Missing latency handling             ✅
Invalid measurement values           ✅
Warning alert integration            ✅
Critical alert integration           ✅
Prediction integration               ✅
Recommendation integration           ✅
Mobile presentation                  ✅
Internationalized labels             ✅
Automated regression testing         ✅
Real OK scenario                     ✅
Controlled RISK scenario             ✅
Real FAILURE scenario                ✅
Packet Tracer failure relationship   ✅
```

---

## 52. Conclusion

The ICMP Network Failure Predictor uses a deterministic three-state classification system to transform technical ICMP measurements into understandable network conditions.

The classification model is:

```text
OK
RISK
FAILURE
```

and is based primarily on:

```text
reachability
latency
packet loss
```

The same classifier is used for both real measurements and future predictions, ensuring consistent interpretation across the system.

Classification is also integrated with:

```text
alerts
history
predictions
recommendations
mobile presentation
```

The current thresholds are intentionally documented as project-defined prototype policy rather than universal networking standards.

This provides a clear, reproducible, testable foundation that can later evolve into configurable or adaptive network-quality policies.
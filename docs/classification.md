# Network Condition Classification

## Purpose

The project classifies network measurements into three internal states:

- `OK`
- `RISK`
- `FAILURE`

The classification transforms raw ICMP measurements into an operational network condition that can later be used by alerts, historical analysis, predictions, activity recommendations and the mobile application.

## Input Metrics

The current classifier uses:

- ICMP availability
- Round-trip latency (RTT)
- Packet loss

Jitter is not currently part of the classification because it is not yet collected by the ICMP monitoring service.

## Classification Rules

### OK

A network measurement is classified as `OK` when:

- the host responds;
- round-trip latency is below 300 ms;
- packet loss is below 1%.

### RISK

A network measurement is classified as `RISK` when the host is still reachable but at least one degradation indicator is present:

- round-trip latency is 300 ms or higher;
- packet loss is 1% or higher;
- latency could not be determined even though a response was detected.

### FAILURE

A network measurement is classified as `FAILURE` when:

- the host does not respond; or
- packet loss reaches 100%.

## Threshold Rationale

The project uses explicit operational thresholds rather than treating them as universal definitions of network quality.

Microsoft documentation for real-time communication identifies RTT below 300 ms and packet loss below 1% as conditions for an optimal experience.

Cisco network design guidance also recommends packet loss below 1% for high-quality real-time voice traffic.

ITU-T G.114 discusses one-way transmission delay and identifies 150 ms as an important reference for interactive communications. Since ICMP ping reports round-trip time rather than one-way latency, the project does not directly compare ping RTT against the ITU one-way value.

## Important Limitation

These thresholds are initial project rules.

They may later be refined using:

- historical measurements;
- rolling averages;
- jitter;
- consecutive failures;
- statistical baselines;
- host-specific behavior;
- predictive models.

The classification logic is intentionally isolated in its own service so thresholds and strategies can evolve without changing the ICMP collector or persistence layer.

## Network Classification Layer

Network condition classification is isolated from ICMP collection and database persistence.

The processing flow is:

`Host → ICMP Monitor → Raw Measurement → Network Classifier → Persistence → REST API`

This separation allows each responsibility to evolve independently.

### Responsibilities

**ICMP Monitor**

Responsible for collecting:

- availability;
- round-trip latency;
- packet loss;
- timestamp.

**Network Classifier**

Responsible for translating raw measurements into:

- `OK`;
- `RISK`;
- `FAILURE`.

**Measurement Persistence Service**

Responsible for storing the measurement and its classification in PostgreSQL.

### Design Rationale

The classifier is implemented as an independent service rather than embedding thresholds directly into API routes or database logic.

This provides:

- easier automated testing;
- centralized classification rules;
- simpler threshold changes;
- reduced coupling;
- support for future statistical or predictive classification strategies.

The current rule-based classifier is an initial operational baseline.

Future versions may incorporate historical windows, jitter, consecutive failures, dynamic baselines and predictive indicators.
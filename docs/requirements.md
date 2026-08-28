# Software Requirements

## 1. Project Goal

Develop a system capable of monitoring network connectivity through ICMP measurements, storing historical observations and providing information that helps identify network degradation or possible failures.

The system will expose network information through a REST API and provide an accessible mobile interface for end users.

---

# 2. Functional Requirements

## Network Monitoring

### FR01 — Register monitored hosts

The system shall allow monitored network hosts or devices to be registered.

Examples:

- computers
- servers
- routers

### FR02 — Perform ICMP measurements

The system shall periodically execute ICMP Echo Requests against registered hosts.

### FR03 — Record network measurements

For each monitoring operation, the system shall record relevant information including:

- timestamp
- host
- response status
- latency
- packet loss

### FR04 — Classify network condition

The system shall classify network connectivity using understandable status categories.

Internal technical states may include:

- OK
- RISK
- FAILURE

The mobile interface shall present equivalent user-friendly terminology.

### FR05 — Display measurement history

The system shall provide access to historical network measurements.

---

# 3. Connectivity Prediction Requirements

### FR06 — Display predicted connectivity condition

The user shall be able to view the predicted connectivity quality.

### FR07 — Consult future predictions

The user shall be able to consult predicted connectivity quality for future periods.

### FR08 — Select a date or time period

The user shall be able to select a date, time or period to consult the expected network condition.

### FR09 — Recommend activities

The system shall indicate whether the expected network quality is adequate for activities such as:

- video calls
- audio calls
- streaming
- online gaming
- web browsing
- file transfers
- messaging

---

# 4. Data Requirements

Each network measurement should contain at least:

- measurement identifier
- monitored host
- timestamp
- latency
- packet loss
- availability / success indicator
- classified state

Historical data shall be preserved to support analysis and connectivity forecasting.

---

# 5. Accessibility Requirements

The mobile application shall:

- support screen readers such as TalkBack and VoiceOver
- provide textual alternatives for visual network status indicators
- not communicate information using color alone
- provide adequate text and interface contrast
- support operating-system font scaling
- avoid mandatory complex gestures
- use clear and understandable language
- preserve logical and predictable navigation
- provide adequate interactive touch areas
- explain technical terms such as latency and packet loss when presented to end users

Detailed accessibility decisions are documented in:

`docs/accessibility.md`

---

# 6. Network Simulation Requirements

The project shall include a Cisco Packet Tracer network simulation.

The simulation shall support the demonstration and comparison of network concepts involving:

- TCP/IP architecture
- IPv4 / IPv6
- ICMP
- ARP
- Ethernet
- TCP / UDP
- application-layer protocols when applicable

Real and simulated scenarios shall be compared during project validation.

---

# 7. Validation Scenarios

The system shall be tested under at least the following connectivity scenarios:

### Scenario A — Normal

Stable host response and acceptable network measurements.

### Scenario B — Unstable

Increasing latency and/or packet loss indicating network degradation.

### Scenario C — Unavailable

Host does not respond to monitoring attempts.

---

# 8. Constraints

The project shall use:

- React Native
- Expo
- REST API integration
- Cisco Packet Tracer for network simulation

Accessibility requirements shall be considered throughout mobile development.

---

# 9. Requirements Traceability

| Requirement | Description | Status |
|---|---|---|
| FR01 | Register monitored hosts | Planned |
| FR02 | Perform ICMP measurements | Planned |
| FR03 | Record measurements | Planned |
| FR04 | Classify network condition | Planned |
| FR05 | Display history | Planned |
| FR06 | Display predicted condition | Planned |
| FR07 | Consult future predictions | Planned |
| FR08 | Select time period | Planned |
| FR09 | Recommend activities | Planned |
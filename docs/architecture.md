# System Architecture

This document describes the proposed architecture of the ICMP Network Failure Predictor.

The system is designed as an integrated solution composed of network monitoring, data persistence, connectivity analysis, REST API services and a mobile application.

---

## 1. Architecture Overview

The project follows the general flow:

    Network Device
          |
          v
    ICMP Monitoring
          |
          v
    Data Collection
          |
          v
    Data Storage
          |
          v
    Analysis and Prediction
          |
          v
    REST API
          |
          v
    Mobile Application

The main objective is to transform raw network measurements into understandable information about connectivity quality and possible network degradation.

---

## 2. Main Components

### 2.1 Monitored Devices

The system may monitor network devices such as:

- computers
- servers
- routers

Each monitored device will be represented as a host inside the system.

A host will contain information such as:

- identifier
- name
- IP address
- description
- monitoring status

---

## 2.2 ICMP Monitoring Service

The monitoring service will be responsible for collecting connectivity information from registered hosts.

The service will use ICMP Echo Request and Echo Reply messages.

For each monitoring cycle, the system should attempt to determine:

- whether the host responded
- response latency
- packet loss
- measurement timestamp
- availability status

The monitoring service will be implemented in Python.

---

## 2.3 Data Collection

Each ICMP monitoring operation generates a network measurement.

A measurement may contain:

- measurement ID
- host ID
- timestamp
- latency in milliseconds
- packet loss percentage
- response success or failure
- network status

The collected information will be preserved so that historical behavior can be analyzed.

---

## 2.4 Data Storage

PostgreSQL was selected as the relational database for the project.

The database will be responsible for storing:

- monitored hosts
- network measurements
- connectivity predictions
- alerts

The database structure will be documented separately inside the `database/` directory.

Initial planned entities:

### Host

Represents a monitored network device.

### Measurement

Represents an individual network monitoring result.

### Prediction

Represents an estimated future network condition generated from historical measurements.

### Alert

Represents an identified condition that may require user attention.

---

## 2.5 Analysis and Prediction Engine

The analysis layer will transform historical network measurements into connectivity indicators.

The initial implementation will use historical data, statistical indicators and defined classification rules.

Possible indicators include:

- average latency
- median latency
- packet loss
- availability rate
- jitter
- recent measurement trend
- time of day

The first project version does not require machine learning.

The prediction strategy may evolve during development if additional requirements are defined by the team or professors.

---

## 2.6 Network Classification

The system will classify network behavior using internal technical states.

Initial planned states:

- `OK`
- `RISK`
- `FAILURE`

Example interpretation:

### OK

The monitored network is responding normally and measurements remain within acceptable conditions.

### RISK

Measurements indicate possible degradation, such as increased latency or packet loss.

### FAILURE

The monitored host is unavailable or presents severe connectivity problems.

Exact classification thresholds will be defined and documented during implementation.

---

## 2.7 REST API

A REST API will provide communication between the backend services and the mobile application.

FastAPI was selected as the backend framework.

The API will provide access to resources such as:

- hosts
- measurements
- historical data
- network status
- predictions
- alerts
- activity recommendations

Planned API flow:

    Mobile Application
           |
           | HTTP / JSON
           v
        FastAPI
           |
           v
      Business Logic
           |
           v
       PostgreSQL

The detailed API contract will be documented in:

`docs/api.md`

---

## 2.8 Mobile Application

The user-facing application will be developed using:

- React Native
- Expo
- TypeScript

The mobile application will consume information exposed by the REST API.

Planned application features include:

- current connectivity status
- future connectivity prediction
- historical measurements
- latency information
- packet-loss information
- activity recommendations
- monitored-host information

---

## 3. Mobile Application Flow

Initial proposed navigation:

    Dashboard
        |
        v
    Current Status
        |
        +--------------------+
        |                    |
        v                    v
    Predictions           History
        |
        v
    Plan Activity
        |
        v
    Prediction Details

Additional screens may be introduced as the requirements evolve.

---

## 4. Activity Recommendation

The system should help users understand whether the predicted network quality is appropriate for common activities.

Examples:

- video calls
- audio calls
- streaming
- online gaming
- web browsing
- file transfers
- messaging

The recommendation engine will use predicted network conditions and predefined activity requirements.

Example:

    Predicted Status: OK
    Activity: Video Call

    Result:
    Connection expected to be suitable for this activity.

Another example:

    Predicted Status: RISK
    Activity: Online Gaming

    Result:
    The connection may present instability during this period.

Recommendations must use clear language and should not require technical networking knowledge from the user.

---

## 5. Accessibility Architecture

Accessibility is considered part of the architecture.

The mobile interface must not rely exclusively on visual elements such as colors.

Network status should combine:

- text
- icons
- accessible labels
- color as additional visual support

Example:

    ✓ Good
    ⚠ Risk of instability
    ✕ Connection failure

The application architecture must support:

- TalkBack
- VoiceOver
- operating-system font scaling
- accessible navigation
- adequate touch areas
- adequate color contrast
- logical focus order

Detailed requirements are documented in:

`docs/accessibility.md`

---

## 6. Cisco Packet Tracer

Cisco Packet Tracer will be used as the network simulation environment.

The simulation will support the study and demonstration of concepts involving:

- TCP/IP
- ICMP
- IPv4
- IPv6
- ARP
- Ethernet
- TCP
- UDP
- network devices
- application-layer protocols when applicable

The simulated environment will be compared with real monitoring scenarios.

Packet Tracer files and related documentation will be stored in:

`network/packet-tracer/`

---

## 7. Repository Architecture

The repository follows a monorepo structure.

    icmp-network-failure-predictor/
    |
    |-- apps/
    |   `-- mobile/
    |
    |-- services/
    |   `-- api/
    |       |-- app/
    |       `-- tests/
    |
    |-- database/
    |   |-- migrations/
    |   `-- schema.sql
    |
    |-- network/
    |   `-- packet-tracer/
    |
    |-- docs/
    |
    |-- assets/
    |   `-- screenshots/
    |
    |-- .github/
    |   `-- workflows/
    |
    |-- .gitignore
    |-- CONTRIBUTING.md
    `-- README.md

---

## 8. Component Responsibilities

### `apps/mobile`

Responsible for:

- user interface
- navigation
- accessibility
- API consumption
- presentation of predictions
- activity recommendations

### `services/api`

Responsible for:

- REST API
- ICMP monitoring
- business rules
- connectivity classification
- prediction logic
- database communication

### `database`

Responsible for:

- database schema
- SQL scripts
- migrations
- database documentation

### `network`

Responsible for:

- Packet Tracer topology
- simulated network scenarios
- network validation documentation

### `docs`

Responsible for:

- requirements
- architecture
- accessibility
- API documentation
- testing strategy
- glossary
- network simulation documentation

### `assets`

Responsible for:

- screenshots
- architecture diagrams
- documentation images

---

## 9. Data Flow

A complete monitoring flow should follow these steps:

1. A monitored host is registered.
2. The monitoring service sends an ICMP Echo Request.
3. The host may return an ICMP Echo Reply.
4. The monitoring service calculates network measurements.
5. The measurement is stored in PostgreSQL.
6. Historical measurements are analyzed.
7. The analysis engine generates indicators.
8. The system classifies the network condition.
9. Prediction information is generated when applicable.
10. The REST API exposes the information.
11. The mobile application requests the data.
12. The information is presented to the user using accessible language.

---

## 10. Technology Decisions

### Python

Selected for:

- ICMP monitoring
- data processing
- analysis
- prediction logic
- backend development

### FastAPI

Selected for:

- REST API development
- integration with Python
- automatic API documentation
- validation support
- testing capabilities

### PostgreSQL

Selected for:

- structured data storage
- historical measurements
- relational modeling
- SQL analysis

### React Native

Selected because it is required by the project specification for mobile development.

### Expo

Selected because it is required by the project specification and simplifies React Native development and testing.

### TypeScript

Selected to improve code organization, typing and maintainability in the mobile application.

### Cisco Packet Tracer

Selected because the network discipline requires simulated network implementation and validation.

---

## 11. Architecture Principles

The project should prioritize:

- clear separation of responsibilities
- maintainable code
- traceability between requirements and implementation
- accessible user interfaces
- reproducible network tests
- secure configuration
- documented technical decisions
- historical data preservation
- testable components

---

## 12. Architecture Status

Current status:

**Initial architecture defined**

The architecture may evolve throughout the project.

Relevant architectural changes should be documented in this file so that the repository reflects the actual implementation.

## Historical Analysis and Alert Layer

Stored network measurements are exposed through historical query and aggregation endpoints.

The flow is:

`ICMP → Classification → Measurement Storage → Historical Analysis → Alerts`

Historical analysis supports:

- filtering by network status;
- filtering by time period;
- limiting returned records;
- aggregated latency statistics;
- aggregated packet loss statistics;
- status distribution.

Alerts are generated automatically during measurement persistence.

`OK` measurements do not generate alerts.

`RISK` measurements generate warning alerts.

`FAILURE` measurements generate critical alerts.

Alerts maintain a reference to the measurement that caused them, providing traceability between network events and notifications.

## Prediction Engine

The prediction engine uses recent historical network measurements to estimate near-future connectivity conditions.

The current prediction flow is:

`Historical Measurements → Recent Window → Linear Trend → Predicted Metrics → Network Classification → Prediction Storage`

### Current Strategy

The initial prediction engine uses a simple linear regression over recent measurements.

The current configuration uses:

- minimum of 3 historical measurements;
- up to the 5 most recent measurements;
- a default forecast horizon of 5 minutes.

The engine independently predicts:

- round-trip latency;
- packet loss.

The predicted metrics are then processed by the existing network classification service to generate:

- `OK`;
- `RISK`;
- `FAILURE`.

### Design Principles

The current model is intentionally simple, transparent and explainable.

It is a statistical baseline rather than a complex machine learning model.

This allows the project to:

- validate the prediction pipeline;
- test trend detection objectively;
- avoid unsupported claims about artificial intelligence;
- evolve the prediction strategy later without changing the monitoring or persistence layers.

### Prediction Confidence

Prediction confidence is currently stored as `null`.

No confidence percentage is generated until a defensible confidence calculation is implemented.

### Future Evolution

Future versions may include:

- larger historical windows;
- rolling averages;
- jitter;
- time-of-day patterns;
- prediction error tracking;
- adaptive baselines;
- more advanced statistical or machine learning models.
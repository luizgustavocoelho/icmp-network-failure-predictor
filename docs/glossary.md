# Glossary

## ICMP Network Failure Predictor

This glossary defines the main technical terms, acronyms, statuses, technologies, and concepts used throughout the ICMP Network Failure Predictor project.

The objective is to provide a common vocabulary for the backend, mobile application, network simulation, database, prediction, and testing documentation.

---

## A

### Accessibility

The practice of designing software so that people with different abilities can perceive, understand, navigate, and interact with the application.

In this project, accessibility includes:

```text
minimum 48 dp touch targets
font scaling
screen-reader semantics
status information not dependent only on color
predictable navigation
accessible language selection
scrollable content
```

---

### Activity Recommendation

A user-oriented recommendation generated from a predicted network condition.

Supported activities include:

```text
Videoconference
Streaming
Online gaming
Web browsing
File upload
```

Possible recommendation states are:

```text
RECOMMENDED
CAUTION
NOT_RECOMMENDED
```

---

### Alert

A record generated when the system detects degraded or unavailable network conditions.

The prototype uses:

```text
WARNING
```

for `RISK` conditions and:

```text
CRITICAL
```

for `FAILURE` conditions.

---

### API

**Application Programming Interface.**

A software interface that allows different applications or components to exchange information.

The project exposes a REST API using FastAPI.

---

### API Base URL

The root address used by a client to access the backend.

Example during local development:

```text
http://localhost:8000
```

A physical mobile device uses the development computer's LAN address instead of `localhost`.

---

### ARP

**Address Resolution Protocol.**

A protocol used to discover the MAC address associated with an IPv4 address on a local network.

During Packet Tracer testing, the first ICMP attempt could experience temporary loss while address-resolution information was being learned.

---

### AsyncStorage

Persistent key-value storage used by React Native applications.

The mobile application uses AsyncStorage to persist the selected interface language.

---

## B

### Backend

The part of the application responsible for business logic, ICMP monitoring, classification, database communication, predictions, alerts, and recommendations.

The backend is implemented using Python and FastAPI.

---

### Baseline Model

A relatively simple model used as an initial reference implementation.

The prediction engine in this project is a statistical baseline based on recent historical data and linear trend estimation.

It is not presented as a machine-learning model.

---

## C

### CAUTION

A recommendation state indicating that an activity may still work but could be affected by the predicted network condition.

In the current prototype, `CAUTION` is primarily associated with predicted `RISK` conditions.

---

### Classification

The process of converting measurement values into a network condition.

The supported states are:

```text
OK
RISK
FAILURE
```

---

### Classifier

The application component responsible for applying the network classification rules.

It evaluates information such as:

```text
success
latency
packet loss
```

---

### Client

An application that consumes the backend API.

In this project, the main client is the React Native mobile application.

Swagger is also used as a development and testing client.

---

### Confidence

A value that could represent the statistical certainty associated with a prediction.

In the current prototype:

```text
confidence = null
```

because a defensible prediction-confidence metric has not yet been implemented.

---

### CRUD

**Create, Read, Update, Delete.**

A common term for basic data-management operations.

The host functionality currently includes creation, retrieval, listing, and updating.

---

## D

### Database

A structured system for persistent data storage.

The project uses PostgreSQL to store information such as:

```text
hosts
measurements
alerts
predictions
```

---

### Default Gateway

A router address used by a device when sending traffic to another IP network.

In Packet Tracer:

```text
PC-Monitor gateway:
192.168.10.1
```

and:

```text
Server-Target gateway:
192.168.20.1
```

---

### Degradation

A situation where connectivity still exists but network quality has worsened.

Examples include:

```text
high latency
partial packet loss
```

The prototype normally represents this condition as:

```text
RISK
```

---

### Dependency

An external library or software package required by the application.

Examples include:

```text
FastAPI
SQLAlchemy
Pydantic
Expo
React Native
AsyncStorage
```

---

### Deprecation Warning

A warning indicating that a library or function is still available but may be removed or changed in a future version.

The final backend regression suite passed all tests while reporting dependency deprecation warnings.

These warnings were not test failures.

---

### dp

**Density-independent pixel.**

A unit commonly used for mobile interface sizing.

The project targets a minimum interactive touch area of:

```text
48 x 48 dp
```

---

## E

### Echo Reply

An ICMP response returned by a destination after receiving an Echo Request.

It is commonly associated with a successful ping.

---

### Echo Request

An ICMP message sent to a destination to test reachability.

The monitored host may respond with an ICMP Echo Reply.

---

### Endpoint

A specific HTTP route exposed by the API.

Example:

```http
POST /hosts/{host_id}/measure
```

---

### End-to-End Validation

A test covering multiple system components from input to final result.

Example:

```text
ICMP measurement
        ↓
classification
        ↓
database
        ↓
API
        ↓
mobile interface
```

---

### Expo

A development platform and framework used together with React Native.

The mobile application was created and tested using Expo.

---

### Expo Router

A file-based navigation system for Expo and React Native applications.

The project uses Expo Router for the mobile tab structure.

---

## F

### FAILURE

One of the three network states used by the application.

A measurement is classified as `FAILURE` when the monitored host is unavailable according to the ICMP measurement logic.

Typical conditions include:

```text
success = false
```

or:

```text
packet loss = 100%
```

---

### FastAPI

A Python framework used to build the project's REST API.

FastAPI also automatically exposes OpenAPI documentation and Swagger UI.

---

### Fetch

A JavaScript API used to make HTTP requests.

The mobile application uses `fetch` to communicate with FastAPI.

---

### Forecast

A prediction generated for a future timestamp selected by the user or defined by the backend.

Example endpoint:

```http
POST /hosts/{host_id}/predictions/forecast
```

---

### Forecast Time

The future moment for which the prediction applies.

Example:

```text
2026-09-04T03:16:00-03:00
```

---

## G

### Gateway

See:

```text
Default Gateway
```

---

### Git

A distributed version-control system used to track source-code changes.

---

### GitHub

The platform used to host the project's Git repository and development history.

The project also used GitHub Issues and project tracking during development.

---

## H

### Historical Data

Measurements stored over time.

Historical information supports:

```text
charts
statistics
network history
predictions
validation
```

---

### Host

A network destination registered for monitoring.

A host can contain:

```text
name
IP address
description
active state
```

Examples used during project validation include public DNS hosts.

---

### HTTP

**Hypertext Transfer Protocol.**

The protocol used between the mobile application or Swagger and the FastAPI backend.

---

### HTTP Method

An operation associated with an API request.

Common methods used by the project include:

```text
GET
POST
PUT
```

---

## I

### ICMP

**Internet Control Message Protocol.**

A network-layer protocol used for diagnostic and control messages.

The project uses ICMP as the basis for connectivity monitoring.

---

### ICMP Echo

A common diagnostic interaction composed of:

```text
Echo Request
Echo Reply
```

It is the basis of the standard `ping` utility.

---

### Internationalization

The process of designing an application to support multiple languages.

The mobile application supports:

```text
English
Portuguese
Spanish
```

---

### IP Address

A logical address used to identify a device or interface on an IP network.

Examples:

```text
8.8.8.8
192.168.10.10
192.168.20.10
```

---

### IPv4

Version 4 of the Internet Protocol.

IPv4 addresses contain four decimal octets.

Example:

```text
192.168.10.10
```

---

### IPv6

Version 6 of the Internet Protocol.

The host-registration backend includes validation for IPv6 addresses in addition to IPv4.

---

## J

### JSON

**JavaScript Object Notation.**

A structured text format commonly used to exchange data through APIs.

Example:

```json
{
  "forecast_for": "2026-09-04T03:16:00-03:00"
}
```

---

## L

### LAN

**Local Area Network.**

A network covering a limited geographic area such as a home, laboratory, office, or building.

During physical-device development, the computer and phone communicated through the same local network.

---

### Latency

The time required for network communication to travel and receive a response.

It is usually represented in:

```text
milliseconds
```

or:

```text
ms
```

Lower latency generally represents a faster response, although acceptable values depend on the application and environment.

---

### Layer 2

The Data Link Layer of the OSI model.

Ethernet switches primarily operate at Layer 2 and forward frames based on MAC addresses.

---

### Layer 3

The Network Layer of the OSI model.

Routers operate at Layer 3 and forward IP packets between different IP networks.

---

### Linear Trend

A simple statistical relationship that estimates how a value is changing over time.

The current prediction baseline uses linear trend estimation on recent network measurements.

---

## M

### MAC Address

**Media Access Control Address.**

A hardware-level identifier used for communication on Ethernet networks.

Switches use MAC-address information when forwarding frames.

---

### Measurement

A stored observation of the monitored network.

A measurement may include:

```text
timestamp
latency
packet loss
success
classification
```

---

### Measurement History

A chronological collection of measurements for a monitored host.

It is used by the History screen and prediction engine.

---

### Measurement Service

The backend service that coordinates the measurement process.

Conceptually:

```text
host
↓
ICMP monitor
↓
classification
↓
persistence
↓
alert evaluation
```

---

### Millisecond

One thousandth of a second.

Symbol:

```text
ms
```

Network latency is commonly expressed in milliseconds.

---

### Mobile Application

The React Native / Expo client used to present network information to the user.

The application contains:

```text
Overview
History
Forecast
Alerts
```

---

### Monitored Host

The destination against which ICMP measurements are performed.

---

### Monitoring Host

A device responsible for initiating monitoring operations.

In the Packet Tracer simulation, this role is represented by:

```text
PC-Monitor
```

---

### Monorepo

A single repository containing multiple parts of a software system.

The project repository contains both:

```text
backend
mobile application
database resources
documentation
network simulation
```

---

## N

### Network Classifier

See:

```text
Classifier
```

---

### Network Condition

The simplified state assigned to a network measurement or prediction.

Supported values:

```text
OK
RISK
FAILURE
```

---

### Network Monitoring

The process of observing connectivity and network-quality indicators over time.

In this project, monitoring is based primarily on ICMP.

---

### Network Simulation

A representation of networking behavior using Cisco Packet Tracer.

The simulation is separate from the real backend runtime.

---

### NOT_RECOMMENDED

A recommendation state indicating that the predicted network condition is unsuitable for the corresponding activity.

In the current policy, activities are marked `NOT_RECOMMENDED` for predicted `FAILURE`.

---

## O

### OK

One of the three network states used by the system.

The prototype classifies a successful measurement as `OK` when:

```text
latency < 300 ms
packet loss < 1%
```

---

### OpenAPI

A specification used to describe REST APIs.

FastAPI automatically generates an OpenAPI definition for the backend.

---

### Operating-System Ping

The native `ping` command executed by the backend's ICMP monitoring service.

The service interprets the command output and converts it into structured data.

---

## P

### Packet

A unit of data transmitted through an IP network.

ICMP Echo messages are carried in IP packets.

---

### Packet Loss

The percentage of transmitted packets that do not successfully produce the expected response.

Example:

```text
Packets sent: 4
Packets received: 3
Packet loss: 25%
```

---

### Packet Tracer

Cisco Packet Tracer is a network simulation and learning environment.

The project uses it to demonstrate:

```text
switching
routing
IPv4 addressing
ICMP
failure
recovery
```

---

### Persistence

The process of storing information so that it remains available after the immediate operation finishes.

The project uses PostgreSQL for persistence.

---

### PostgreSQL

An open-source relational database-management system.

It is used by the backend to persist project data.

---

### Prediction

An estimate of a future network condition based on previous measurements.

A prediction may contain:

```text
predicted latency
predicted packet loss
predicted status
forecast timestamp
```

---

### Prediction Engine

The backend component responsible for calculating connectivity forecasts.

The current implementation uses a statistical baseline.

---

### Prediction History

Previously generated predictions stored by the application.

---

### Prediction versus Actual Validation

A validation method where a forecast is generated and later compared with a real network measurement.

One project validation produced:

```text
Predicted latency:
8.13 ms

Observed latency:
5.00 ms

Predicted packet loss:
0%

Observed packet loss:
0%

Predicted status:
OK

Observed status:
OK
```

This test demonstrates that the prediction pipeline operates correctly.

It does not establish global statistical accuracy.

---

### PDU

**Protocol Data Unit.**

A generic term for a unit of information at a particular networking layer.

Packet Tracer's:

```text
Add Simple PDU
```

tool was used to simulate ICMP communication.

---

### Pull-to-Refresh

A mobile interaction where the user drags the screen downward to request updated information.

The application uses this behavior on several screens.

---

### Pydantic

A Python data-validation library used by FastAPI.

It is used to validate API input and output schemas.

---

### Pytest

A Python testing framework.

The final backend regression suite produced:

```text
82 tests collected
82 passed
0 failed
```

---

## R

### React Native

A framework used to develop mobile applications using JavaScript or TypeScript and React concepts.

The project's mobile interface is implemented using React Native.

---

### RECOMMENDED

A recommendation state indicating that the predicted network condition is considered suitable for the selected activity according to the prototype policy.

---

### Recommendation Engine

The backend component that converts a predicted network condition into activity-specific suitability information.

---

### REST

**Representational State Transfer.**

An architectural style commonly used for web APIs.

The project's FastAPI backend exposes REST-style endpoints.

---

### RISK

One of the three network states supported by the project.

`RISK` indicates that the host remains reachable but degradation has been detected.

Examples include:

```text
latency >= 300 ms
```

or:

```text
packet loss >= 1% and < 100%
```

---

### Router

A Layer 3 network device responsible for forwarding packets between different IP networks.

In Packet Tracer, the router is named:

```text
R1
```

---

### Routing

The process of determining where IP packets should be forwarded between networks.

The Packet Tracer router connects:

```text
192.168.10.0/24
```

and:

```text
192.168.20.0/24
```

---

## S

### Safe Area

A region of the mobile interface that avoids overlap with operating-system areas such as:

```text
status bars
screen cutouts
device edges
```

The mobile application uses `react-native-safe-area-context`.

---

### Schema

A definition describing the structure and validation rules of data.

In the backend, Pydantic schemas define API request and response data.

Database schemas define persistent data structures.

---

### Screen Reader

Assistive technology that converts interface information into spoken or otherwise accessible output.

Examples include:

```text
Android TalkBack
Apple VoiceOver
```

---

### SQL

**Structured Query Language.**

A language used to interact with relational databases.

---

### SQLAlchemy

A Python toolkit and ORM used by the backend to interact with PostgreSQL.

---

### Status

A simplified condition assigned to a network measurement or prediction.

The project supports:

```text
OK
RISK
FAILURE
```

---

### Subnet

A logical subdivision of an IP network.

Packet Tracer uses two subnets:

```text
192.168.10.0/24
192.168.20.0/24
```

---

### Subnet Mask

A value used to determine which portion of an IPv4 address represents the network and which represents the host.

For the Packet Tracer networks:

```text
255.255.255.0
```

is equivalent to:

```text
/24
```

---

### Swagger

An interactive web interface generated from the API's OpenAPI specification.

The FastAPI development documentation is available locally through:

```text
/docs
```

Swagger was used extensively during project validation.

---

### Switch

A network device that primarily forwards Ethernet frames within a Layer 2 network.

Packet Tracer uses:

```text
SW-Monitor
SW-Target
```

---

## T

### TCP/IP

A suite of protocols used for modern network communication.

ICMP operates at the Internet layer of the TCP/IP model.

---

### TEST-NET

IPv4 address ranges reserved for documentation and examples.

The project used:

```text
192.0.2.1
```

as a controlled unreachable test host during failure validation.

---

### Threshold

A value used to determine when a measurement changes classification.

The current project-defined thresholds include:

```text
300 ms latency
1% packet loss
100% packet loss
```

---

### Timezone

Information describing the local offset from Coordinated Universal Time.

Custom forecasts require timezone-aware timestamps.

Example:

```text
2026-09-04T03:16:00-03:00
```

---

### Timestamp

A representation of a specific date and time.

Measurements and predictions use timestamps to identify when events occurred or when a forecast applies.

---

### TypeScript

A typed programming language based on JavaScript.

The mobile application uses TypeScript for screen logic, API contracts, and reusable components.

---

## U

### UTC

**Coordinated Universal Time.**

A global reference time standard.

The suffix:

```text
Z
```

in an ISO timestamp indicates UTC.

Example:

```text
2026-09-04T06:16:00Z
```

is equivalent to:

```text
2026-09-04T03:16:00-03:00
```

for a UTC-3 timezone.

---

### Uvicorn

An ASGI server used to run the FastAPI application during development.

Example:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## V

### Validation

The process of verifying that a system behaves according to its requirements and intended use.

The project uses:

```text
automated tests
real ICMP tests
controlled degradation tests
mobile tests
Packet Tracer tests
prediction comparison
```

---

### VoiceOver

Apple's screen-reader technology.

The mobile accessibility architecture is designed to support semantic information usable by assistive technologies such as VoiceOver.

A complete formal multi-device VoiceOver audit remains future work.

---

## W

### WARNING

An alert severity associated with a degraded but still reachable network state.

Relationship:

```text
RISK
→ WARNING
```

---

### Web Browsing

One of the activities evaluated by the recommendation engine.

Under the current project policy, web browsing remains:

```text
RECOMMENDED
```

during a predicted `RISK` condition.

---

## Additional Project Terms

### PC-Monitor

The monitoring workstation used in the Cisco Packet Tracer topology.

Configuration:

```text
IP:
192.168.10.10

Gateway:
192.168.10.1
```

---

### SW-Monitor

The Layer 2 switch used on the monitoring side of the Packet Tracer topology.

---

### R1

The Cisco router used to connect the monitoring and monitored networks in Packet Tracer.

Interfaces:

```text
GigabitEthernet0/0
192.168.10.1/24
```

```text
GigabitEthernet0/1
192.168.20.1/24
```

---

### SW-Target

The Layer 2 switch used on the monitored side of the Packet Tracer topology.

---

### Server-Target

The monitored server used in Packet Tracer.

Configuration:

```text
IP:
192.168.20.10

Gateway:
192.168.20.1
```

---

### Monitoring Network

The Packet Tracer subnet containing the monitoring workstation.

```text
192.168.10.0/24
```

---

### Monitored Network

The Packet Tracer subnet containing the monitored server.

```text
192.168.20.0/24
```

---

## Status Relationship Summary

```text
CURRENT OR PREDICTED NETWORK CONDITION

OK
│
├── Healthy according to prototype rules
├── No degradation alert
└── Activities generally RECOMMENDED


RISK
│
├── Connectivity remains available
├── Degradation detected
├── WARNING alert for real measurement
└── Activities may become CAUTION


FAILURE
│
├── Connectivity unavailable through ICMP
├── CRITICAL alert for real measurement
└── Activities NOT_RECOMMENDED
```

---

## System Flow Summary

```text
Monitored Host
      ↓
ICMP
      ↓
Latency / Packet Loss / Reachability
      ↓
Network Classifier
      ↓
OK / RISK / FAILURE
      ↓
PostgreSQL
      ↓
History / Alerts
      ↓
Prediction
      ↓
Recommendations
      ↓
FastAPI
      ↓
React Native / Expo
      ↓
User
```

---

## Final Note

The terms in this glossary reflect the meaning used specifically within the ICMP Network Failure Predictor.

Some networking concepts, especially quality thresholds and activity suitability, may have different interpretations in other environments.

The project therefore distinguishes between:

```text
standard technical concepts
```

such as:

```text
ICMP
IPv4
routing
packet loss
latency
```

and:

```text
project-defined policies
```

such as:

```text
OK / RISK / FAILURE thresholds
activity recommendation rules
alert severity behavior
```

This distinction helps keep the prototype technically transparent and academically defensible.
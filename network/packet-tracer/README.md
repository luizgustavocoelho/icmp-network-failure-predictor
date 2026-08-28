# ICMP Network Failure Predictor

An integrated software project for network monitoring, connectivity quality prediction and failure-risk classification using ICMP measurements.

The system collects network measurements, stores historical data, analyzes connectivity behavior and exposes the results through a REST API consumed by a mobile application.

> Academic interdisciplinary project developed as part of the Systems Analysis and Development program.

---

## Project Overview

Network instability can affect activities such as video calls, streaming, online gaming, web browsing and file transfers.

This project aims to monitor network behavior and use historical measurements to help identify connectivity degradation and possible failures.

The system will provide information such as:

- network availability
- latency
- packet loss
- historical measurements
- connectivity status
- future connectivity estimates
- activity recommendations

---

## Proposed Architecture

```text
Network Device
      |
      v
ICMP Echo Request / Reply
      |
      v
Python Monitoring Service
      |
      v
PostgreSQL
      |
      v
Prediction / Classification Engine
      |
      v
REST API
      |
      v
React Native + Expo Mobile App
```

Cisco Packet Tracer will also be used to simulate and validate network scenarios.

---

## Main Technologies

### Backend & Data

- Python
- FastAPI
- PostgreSQL
- SQL

### Mobile

- React Native
- Expo
- TypeScript

### Networking

- ICMP
- TCP/IP
- Cisco Packet Tracer

### Engineering

- Git
- GitHub
- pytest
- REST API
- Accessibility practices

---

## Core Features

- Register monitored hosts
- Perform ICMP network measurements
- Measure latency and packet loss
- Store historical network measurements
- Classify connectivity conditions
- Generate connectivity forecasts
- Display historical data
- Recommend activities based on expected network quality
- Provide accessible mobile navigation and content

---

## Repository Structure

```text
apps/
  mobile/

services/
  api/

database/

network/
  packet-tracer/

docs/

assets/
  screenshots/
```

---

## Documentation

Project documentation is maintained inside the `docs/` directory.

- Requirements
- Architecture
- Accessibility
- API
- Testing
- Network simulation
- Glossary

---

## Project Status

🚧 **In development**

Current phase:

**Requirements and architecture definition**

---

## Academic Context

The project integrates concepts from:

- Systems Analysis and Design
- Data Structures
- Mobile Application Development
- Computer Networks

---

## Author

**Luiz Coelho**

Systems Analysis and Development student focused on Data Engineering.

- GitHub: [luizgustavocoelho](https://github.com/luizgustavocoelho)
- LinkedIn: [luizgustavocoelho](https://www.linkedin.com/in/luizgustavocoelho/)
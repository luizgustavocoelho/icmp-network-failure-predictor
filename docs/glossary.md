# Project Glossary

This document defines the main technical terms used throughout the project.

The same terminology should be used consistently in the mobile application, API, documentation, network simulation and project presentation.

---

## ICMP

**Internet Control Message Protocol**

A network protocol commonly used for diagnostics, error reporting and connectivity verification between devices.

In this project, ICMP will be used to monitor whether network hosts are reachable and to collect connectivity measurements.

---

## Echo Request

An ICMP message sent by one device to another to verify whether the destination can be reached.

It is commonly associated with the `ping` command.

---

## Echo Reply

The ICMP response returned by a network host after receiving an Echo Request.

The time between sending the request and receiving the reply can be used to estimate network latency.

---

## Host

A device connected to a network that can send or receive data.

Examples include:

- computers
- servers
- routers

Hosts registered in the system may be monitored through ICMP.

---

## Latency

The amount of time required for data to travel through the network and return.

Latency is usually measured in milliseconds (`ms`).

Higher latency may indicate slower network communication.

---

## Packet Loss

The percentage of network packets that fail to reach their destination or return successfully.

Higher packet loss may indicate network instability or degradation.

---

## Availability

Indicates whether a monitored host is reachable during a network measurement.

A host that responds successfully to ICMP requests is considered available for that measurement.

---

## Jitter

The variation in latency between consecutive network measurements.

High jitter may indicate unstable network performance.

---

## Measurement

A record generated during the monitoring process.

A measurement may contain information such as:

- timestamp
- monitored host
- latency
- packet loss
- response status
- classified network state

---

## Historical Data

The collection of network measurements stored over time.

Historical data will be used to analyze network behavior and support connectivity predictions.

---

## Network Status

A classification representing the current or predicted condition of the monitored network.

Internal technical states may include:

- `OK`
- `RISK`
- `FAILURE`

The mobile application may present equivalent terms in simpler language for end users.

---

## Prediction

An estimate of future network conditions generated from historical measurements and defined analysis rules.

Predictions may consider information such as:

- latency history
- packet loss
- availability
- measurement trends
- time of day

---

## REST API

An interface that allows different software components to communicate through HTTP requests.

In this project, the REST API will connect the backend services and the mobile application.

---

## Endpoint

A specific address exposed by the REST API that provides access to a resource or operation.

Examples may include:

- monitored hosts
- measurements
- network history
- predictions

---

## PostgreSQL

The relational database management system planned for storing project data.

It will be used to persist information such as monitored hosts, network measurements, predictions and alerts.

---

## React Native

A framework used to build mobile applications using JavaScript or TypeScript.

It will be used to develop the project's mobile interface.

---

## Expo

A development platform and toolset used together with React Native.

Expo simplifies development, testing and execution of the mobile application.

---

## Packet Tracer

A network simulation tool developed by Cisco.

It will be used to create simulated network environments and compare simulated scenarios with the project's real monitoring behavior.

---

## TCP/IP

A collection of communication protocols used by devices connected to computer networks.

The project will apply concepts related to different TCP/IP layers during network simulation and analysis.

---

## Accessibility

The practice of designing software so that people with different abilities and assistive technologies can use it effectively.

Accessibility requirements in this project include:

- screen-reader compatibility
- adequate contrast
- text scaling
- predictable navigation
- adequate touch targets
- color-independent information
- simple language
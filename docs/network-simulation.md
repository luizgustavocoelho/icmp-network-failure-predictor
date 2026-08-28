# Network Simulation

This document defines the initial strategy for the network simulation component of the ICMP Network Failure Predictor.

Cisco Packet Tracer will be used to create a simulated local network environment and demonstrate networking concepts related to the project.

The simulated environment will later be compared with real ICMP monitoring results.

---

## 1. Simulation Objective

The main objective of the network simulation is to create a controlled environment where the team can:

- build a local network
- configure network devices
- test connectivity
- observe ICMP communication
- apply TCP/IP concepts
- simulate different network conditions
- compare simulated behavior with real monitoring results

The Packet Tracer simulation will complement the real monitoring system developed by the project.

---

## 2. Initial Proposed Topology

The first proposed topology will contain:

- one router
- one switch
- multiple end devices
- optional server

Initial concept:

    PC-01 --------\
                   \
    PC-02 ---------- Switch ---------- Router
                   /
    Server --------/

The final topology may evolve according to the requirements of the networking discipline.

---

## 3. Network Devices

The initial simulation may use the following devices.

### Router

Responsible for network routing and communication between different networks when multiple subnets are introduced.

### Switch

Responsible for connecting devices inside the local network.

### PCs

Represent end-user devices connected to the network.

### Server

May be introduced to demonstrate services and application-layer protocols when applicable.

---

## 4. TCP/IP Architecture

The simulation will demonstrate concepts from different TCP/IP layers.

### Application Layer

Protocols that may be demonstrated when applicable:

- HTTP
- HTTPS
- DNS
- FTP
- SFTP

### Transport Layer

Protocols:

- TCP
- UDP

### Internet Layer

Protocols and concepts:

- IPv4
- IPv6
- ICMP
- routing

### Network Access Layer

Protocols and technologies:

- Ethernet
- ARP

The final simulation does not need to use every protocol simultaneously.

Protocols should be included when they contribute to the project demonstration.

---

## 5. IPv4 Addressing

The first network topology will use private IPv4 addresses.

Example addressing plan:

| Device | Example Address |
|---|---|
| Router | 192.168.10.1 |
| PC-01 | 192.168.10.10 |
| PC-02 | 192.168.10.11 |
| Server | 192.168.10.20 |

Example subnet mask:

`255.255.255.0`

Example network:

`192.168.10.0/24`

These addresses are examples and may be changed during implementation.

---

## 6. ICMP Demonstration

ICMP is one of the central protocols used by the project.

The Packet Tracer environment should demonstrate ICMP Echo Request and Echo Reply communication.

Example test:

From PC-01:

`ping 192.168.10.1`

Expected behavior:

PC-01 sends an ICMP Echo Request to the router.

The router receives the request and returns an ICMP Echo Reply.

Successful communication demonstrates that the destination is reachable.

---

## 7. Packet Tracer Simulation Mode

Packet Tracer Simulation Mode may be used to inspect packets moving through the network.

The team should observe:

- packet source
- packet destination
- ICMP Echo Request
- ICMP Echo Reply
- device path
- protocol behavior

Screenshots or recordings may be collected as evidence for documentation and the final presentation.

---

## 8. ARP Observation

ARP may be observed during communication between devices in the same local network.

The simulation may demonstrate the relationship between:

- IP addresses
- MAC addresses
- ARP requests
- ARP replies

This helps explain how devices discover the physical address associated with a destination IP address inside the local network.

---

## 9. Real Monitoring Environment

The real project will monitor network hosts outside Packet Tracer using the Python monitoring service.

The real monitoring process is expected to collect information such as:

- timestamp
- latency
- packet loss
- response success or failure
- availability
- classified network state

Real monitoring results will be stored in the project database.

---

## 10. Simulated Environment vs Real Environment

One of the project validation activities will compare network behavior observed in Packet Tracer with measurements collected by the real application.

The comparison may consider:

| Aspect | Packet Tracer | Real Monitoring |
|---|---|---|
| Network topology | Simulated | Physical / real |
| ICMP | Simulated packets | Real ICMP requests |
| Latency | Simulator behavior | Measured in milliseconds |
| Packet loss | Simulated scenario | Measured result |
| Availability | Controlled | Real device availability |
| Protocol observation | Detailed simulation | Operating-system/network tools |

The comparison should explain both similarities and limitations.

---

## 11. Validation Scenarios

The network simulation should support scenarios compatible with the general project testing strategy.

### Scenario A — Normal Connectivity

Expected characteristics:

- devices are correctly configured
- ICMP requests succeed
- destinations are reachable
- routing and addressing are correct

Expected result:

Communication occurs normally.

---

### Scenario B — Connectivity Problem

A controlled problem should be introduced.

Possible examples:

- incorrect IP configuration
- incorrect subnet mask
- incorrect default gateway
- disconnected interface
- unavailable destination

Expected result:

Communication is affected and the team identifies the cause.

The exact scenario will be selected during Packet Tracer implementation.

---

### Scenario C — Unavailable Destination

A destination should become unreachable.

Possible examples:

- disconnected device
- disabled interface
- incorrect network configuration

Expected result:

ICMP communication fails.

The simulated behavior can then be compared with how the real monitoring application records an unavailable host.

---

## 12. Validation Process

The planned validation process is:

1. Build the Packet Tracer topology.
2. Configure network devices.
3. Configure IPv4 addressing.
4. Verify connectivity.
5. Execute ICMP tests.
6. Observe ICMP packets in Simulation Mode.
7. Introduce a controlled connectivity problem.
8. Observe the resulting communication failure.
9. Execute similar tests using the real monitoring application.
10. Compare simulated and real results.
11. Document conclusions.

---

## 13. Evidence

Evidence from the Packet Tracer simulation may include:

- topology screenshots
- device configuration screenshots
- successful ping tests
- failed ping tests
- Simulation Mode screenshots
- ICMP packet inspection
- ARP observation
- comparison tables
- video demonstration

Relevant screenshots may be stored in:

`assets/screenshots/`

The Packet Tracer project file will be stored in:

`network/packet-tracer/`

---

## 14. Packet Tracer File

The final Packet Tracer topology should be saved using a descriptive file name.

Planned file:

`network/packet-tracer/icmp-network-topology.pkt`

Temporary and backup files should not replace the final documented topology.

---

## 15. Packet Tracer README

The directory:

`network/packet-tracer/`

contains its own `README.md`.

That document will later describe:

- topology
- devices
- addressing
- configuration
- testing instructions
- expected results
- screenshots

---

## 16. Video Demonstration

The networking component will be included in the final project demonstration video.

The networking section should demonstrate:

- the Packet Tracer topology
- network configuration
- ICMP communication
- simulated network behavior
- the real monitoring system
- comparison between simulated and real environments
- project conclusions

The final video requirements will follow the instructions provided by the networking discipline.

---

## 17. Network Simulation Status

Current status:

**Simulation strategy defined**

The Packet Tracer topology has not yet been implemented.

The next networking step will be to install or open Cisco Packet Tracer and create the initial local network topology.
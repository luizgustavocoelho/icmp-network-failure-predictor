# Network Simulation

## ICMP Network Failure Predictor

This document describes the Cisco Packet Tracer network simulation created for the ICMP Network Failure Predictor project.

The simulation demonstrates the network behavior behind ICMP monitoring, including:

- IPv4 addressing;
- subnet separation;
- Layer 2 switching;
- Layer 3 routing;
- default gateway usage;
- ICMP Echo Request;
- ICMP Echo Reply;
- connectivity failure;
- interface shutdown;
- network recovery.

The Packet Tracer environment is used as a network-learning and validation artifact.

It does not directly provide measurements to the FastAPI backend.

---

## 1. Simulation Objective

The main objective of the simulation is to represent the network communication that the real ICMP Network Failure Predictor monitors.

The simulated topology allows the project to demonstrate:

```text
Monitoring device
        ↓
ICMP Echo Request
        ↓
Network infrastructure
        ↓
Monitored host
        ↓
ICMP Echo Reply
        ↓
Monitoring device
```

The simulation also demonstrates what happens when part of the communication path becomes unavailable.

---

## 2. Packet Tracer Topology

The final topology contains five network devices:

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

Devices used:

| Device | Packet Tracer Model | Function |
| --- | --- | --- |
| PC-Monitor | PC-PT | Monitoring workstation |
| SW-Monitor | Cisco 2960-24TT | Monitoring-side Layer 2 switch |
| R1 | Cisco 2911 | Router between the two networks |
| SW-Target | Cisco 2960-24TT | Monitored-side Layer 2 switch |
| Server-Target | Server-PT | Monitored destination host |

---

## 3. Logical Network Design

The topology was divided into two IPv4 networks.

### Monitoring Network

```text
Network:
192.168.10.0/24
```

This network contains:

```text
PC-Monitor
SW-Monitor
R1 GigabitEthernet0/0
```

### Monitored Network

```text
Network:
192.168.20.0/24
```

This network contains:

```text
R1 GigabitEthernet0/1
SW-Target
Server-Target
```

The router connects both networks.

---

## 4. IPv4 Addressing

### PC-Monitor

```text
Device: PC-Monitor

IPv4 Address:
192.168.10.10

Subnet Mask:
255.255.255.0

Default Gateway:
192.168.10.1
```

### Router R1 — Monitoring Side

```text
Interface:
GigabitEthernet0/0

IPv4 Address:
192.168.10.1

Subnet Mask:
255.255.255.0
```

### Router R1 — Monitored Side

```text
Interface:
GigabitEthernet0/1

IPv4 Address:
192.168.20.1

Subnet Mask:
255.255.255.0
```

### Server-Target

```text
Device: Server-Target

IPv4 Address:
192.168.20.10

Subnet Mask:
255.255.255.0

Default Gateway:
192.168.20.1
```

---

## 5. Addressing Summary

| Device | Interface | IPv4 Address | Network |
| --- | --- | --- | --- |
| PC-Monitor | FastEthernet0 | 192.168.10.10/24 | 192.168.10.0/24 |
| R1 | GigabitEthernet0/0 | 192.168.10.1/24 | 192.168.10.0/24 |
| R1 | GigabitEthernet0/1 | 192.168.20.1/24 | 192.168.20.0/24 |
| Server-Target | FastEthernet0 | 192.168.20.10/24 | 192.168.20.0/24 |

The switches do not require management IP addresses for the functionality demonstrated in this simulation.

Their role is Layer 2 frame forwarding.

---

## 6. Physical Connections

Copper Straight-Through cables were used for the topology.

The final connections are:

```text
PC-Monitor FastEthernet0
        ↓
SW-Monitor FastEthernet0/1
```

```text
SW-Monitor GigabitEthernet0/1
        ↓
R1 GigabitEthernet0/0
```

```text
R1 GigabitEthernet0/1
        ↓
SW-Target GigabitEthernet0/1
```

```text
SW-Target FastEthernet0/1
        ↓
Server-Target FastEthernet0
```

Logical representation:

```text
PC-Monitor
192.168.10.10
      │
      │
SW-Monitor
      │
      │
R1
G0/0: 192.168.10.1
G0/1: 192.168.20.1
      │
      │
SW-Target
      │
      │
Server-Target
192.168.20.10
```

---

## 7. Router Configuration

The Cisco 2911 router was configured using the CLI.

### GigabitEthernet0/0

```text
enable
configure terminal

interface gigabitEthernet 0/0
ip address 192.168.10.1 255.255.255.0
no shutdown
exit
```

### GigabitEthernet0/1

```text
interface gigabitEthernet 0/1
ip address 192.168.20.1 255.255.255.0
no shutdown
exit
```

The configuration was completed with:

```text
end
write
```

After configuration, both router interfaces reached:

```text
up / up
```

---

## 8. Routing Behavior

No additional static route was required.

Both networks are directly connected to R1:

```text
192.168.10.0/24
        ↓
GigabitEthernet0/0
```

and:

```text
192.168.20.0/24
        ↓
GigabitEthernet0/1
```

Therefore, R1 can route packets directly between the two networks.

---

## 9. Default Gateway Behavior

The PC-Monitor belongs to:

```text
192.168.10.0/24
```

The Server-Target belongs to:

```text
192.168.20.0/24
```

Because these devices belong to different IP networks, they cannot communicate directly at Layer 2.

When PC-Monitor sends traffic to:

```text
192.168.20.10
```

it determines that the destination is outside its local subnet.

The packet is therefore sent to:

```text
Default Gateway:
192.168.10.1
```

R1 receives the packet and forwards it toward:

```text
192.168.20.0/24
```

through:

```text
GigabitEthernet0/1
```

The Server-Target uses:

```text
192.168.20.1
```

as its default gateway for the return path.

---

## 10. ICMP Communication Flow

The primary communication tested in Packet Tracer is ICMP.

The monitoring-side host sends an:

```text
ICMP Echo Request
```

to:

```text
192.168.20.10
```

The expected path is:

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

The Server-Target responds using:

```text
ICMP Echo Reply
```

The response follows the reverse path:

```text
Server-Target
    ↓
SW-Target
    ↓
R1
    ↓
SW-Monitor
    ↓
PC-Monitor
```

---

## 11. Initial Connectivity Test

The first validation tested communication between PC-Monitor and its gateway.

Command executed from PC-Monitor:

```text
ping 192.168.10.1
```

Result:

```text
Packets sent: 4
Packets received: 4
Packets lost: 0

Packet loss:
0%
```

This confirmed connectivity between:

```text
PC-Monitor
    ↓
SW-Monitor
    ↓
R1
```

---

## 12. End-to-End Connectivity Test

The next test validated communication between both networks.

Command:

```text
ping 192.168.20.10
```

During the first execution, the initial packet was lost while the network completed address-resolution behavior.

The remaining packets succeeded.

A subsequent test produced:

```text
Packets sent: 4
Packets received: 4
Packets lost: 0

Packet loss:
0%
```

This confirmed successful end-to-end routing.

---

## 13. ARP and Initial Packet Behavior

During initial connectivity tests, Packet Tracer may show the first ICMP packet timing out while devices resolve Layer 2 addresses.

This does not necessarily represent persistent network degradation.

After the address-resolution process completed, repeated connectivity tests resulted in:

```text
0% packet loss
```

For this reason, stable repeated measurements were used as the reference for the normal operating scenario.

---

## 14. Simulation Mode

Packet Tracer Simulation Mode was used to inspect the ICMP communication visually.

The event filter was focused on:

```text
ICMP
```

A Simple PDU was generated from:

```text
PC-Monitor
```

to:

```text
Server-Target
```

Using:

```text
Add Simple PDU
```

The packet was advanced manually using:

```text
Capture / Forward
```

The ICMP Echo Request was observed moving through:

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

The ICMP Echo Reply was then observed returning through:

```text
Server-Target
    ↓
SW-Target
    ↓
R1
    ↓
SW-Monitor
    ↓
PC-Monitor
```

The successful return to PC-Monitor confirmed end-to-end ICMP connectivity.

---

## 15. OSI and TCP/IP Interpretation

The Packet Tracer simulation helps demonstrate how different network devices participate in the communication process.

### PC-Monitor

The PC creates the ICMP packet and determines whether the destination belongs to the local network.

Because the Server-Target is located on another subnet, the PC sends the traffic toward its default gateway.

### SW-Monitor

The switch operates primarily at Layer 2.

It forwards Ethernet frames according to MAC address information.

### R1

The router operates at Layer 3.

It examines the destination IPv4 address:

```text
192.168.20.10
```

and determines that:

```text
192.168.20.0/24
```

is directly connected through:

```text
GigabitEthernet0/1
```

### SW-Target

The target-side switch forwards the Ethernet frame toward the Server-Target.

### Server-Target

The server receives the ICMP Echo Request and generates an ICMP Echo Reply.

---

## 16. Normal Operation Scenario

The first official scenario represents a healthy network.

Conditions:

```text
R1 G0/0:
up / up

R1 G0/1:
up / up
```

Result:

```text
PC-Monitor → Server-Target
Successful
```

Final stable ping result:

```text
Packets sent: 4
Packets received: 4
Packets lost: 0

Packet loss:
0%
```

Simulation Mode also showed successful:

```text
Echo Request
```

and:

```text
Echo Reply
```

---

## 17. Failure Scenario

A controlled connectivity failure was intentionally introduced.

The interface connecting R1 to the monitored network was selected:

```text
GigabitEthernet0/1
```

The following command was executed:

```text
enable
configure terminal
interface gigabitEthernet 0/1
shutdown
end
```

The interface state was verified using:

```text
show ip interface brief
```

The expected state was:

```text
GigabitEthernet0/1
administratively down
down
```

---

## 18. Failure Result

After disabling the router interface, PC-Monitor attempted to communicate with:

```text
192.168.20.10
```

The resulting ping showed:

```text
Packets sent: 4
Packets received: 0
Packets lost: 4

Packet loss:
100%
```

The command output also included:

```text
Destination host unreachable
```

This confirmed that the monitored network was no longer reachable through the router.

---

## 19. Failure in Simulation Mode

The failure scenario was also reproduced using Packet Tracer Simulation Mode.

A new ICMP Simple PDU was generated:

```text
PC-Monitor
        ↓
Server-Target
```

The packet traveled through:

```text
PC-Monitor
    ↓
SW-Monitor
    ↓
R1
```

but could not continue toward:

```text
SW-Target
```

because:

```text
R1 GigabitEthernet0/1
```

was administratively disabled.

Packet Tracer displayed a failed PDU event.

This visually demonstrated the network-level cause of the connectivity failure.

---

## 20. Relationship to Application FAILURE Status

The simulated interface failure represents the type of network behavior that the real application detects through ICMP.

Conceptually:

```text
Network interface unavailable
        ↓
Destination becomes unreachable
        ↓
ICMP receives no valid response
        ↓
100% packet loss
        ↓
FAILURE
```

In the real ICMP Network Failure Predictor, a failure condition can result in:

```text
success = false
packet_loss_pct = 100
status = FAILURE
```

The application can then generate:

```text
CRITICAL alert
```

and recommendations such as:

```text
NOT_RECOMMENDED
```

for network-dependent activities.

---

## 21. Recovery Scenario

After the failure test, the router interface was restored.

Commands:

```text
enable
configure terminal
interface gigabitEthernet 0/1
no shutdown
end
write
```

The interface returned to:

```text
up / up
```

The physical link returned to the active state.

---

## 22. Recovery Behavior

Immediately after restoring the connection, temporary packet loss was observed while the network returned to its stable operational state.

Observed sequence:

```text
Initial failure:
100% packet loss
```

followed by:

```text
Recovery test:
25% packet loss
```

and finally:

```text
Stable recovery:
0% packet loss
```

The final successful result was:

```text
Packets sent: 4
Packets received: 4
Packets lost: 0

Packet loss:
0%
```

This demonstrated successful recovery of network connectivity.

---

## 23. Tested Scenarios

Three main states were demonstrated in Packet Tracer.

### Scenario 1 — Normal Operation

```text
Network links operational
Routing operational
ICMP request successful
ICMP reply successful
0% stable packet loss
```

Result:

```text
SUCCESS
```

### Scenario 2 — Link / Interface Failure

```text
R1 G0/1 administratively down
Monitored network unreachable
ICMP communication interrupted
100% packet loss
```

Result:

```text
FAILURE
```

### Scenario 3 — Recovery

```text
R1 G0/1 restored
Network convergence
Communication restored
Final packet loss = 0%
```

Result:

```text
RECOVERED
```

---

## 24. Real Environment Versus Packet Tracer

The project intentionally separates the real monitoring system from the simulated network.

### Packet Tracer

Cisco Packet Tracer demonstrates:

```text
network architecture
physical/logical topology
subnet separation
IPv4 addressing
default gateway behavior
Layer 2 switching
Layer 3 routing
ICMP communication
interface failure
network recovery
```

### Real Application

The actual prototype performs:

```text
Operating-system ICMP ping
        ↓
Python monitoring service
        ↓
Measurement processing
        ↓
Network classification
        ↓
PostgreSQL
        ↓
Prediction engine
        ↓
Recommendation engine
        ↓
FastAPI
        ↓
React Native mobile application
```

Packet Tracer does not directly send its simulated measurements to FastAPI.

The two environments complement each other.

---

## 25. Relationship Between Both Environments

Packet Tracer answers:

```text
What happens to the packet inside the network?
```

The ICMP Network Failure Predictor answers:

```text
What can the system determine from the communication result?
```

Together, they demonstrate:

```text
Network behavior
        +
Monitoring
        +
Data persistence
        +
Classification
        +
Prediction
        +
User interface
```

---

## 26. Packet Tracer Final Layout

The final topology was visually organized into two network areas.

### Monitoring Network

```text
MONITORING NETWORK
192.168.10.0/24
```

Containing:

```text
PC-Monitor
SW-Monitor
```

### Router

```text
R1

G0/0:
192.168.10.1/24

G0/1:
192.168.20.1/24
```

### Monitored Network

```text
MONITORED NETWORK
192.168.20.0/24
```

Containing:

```text
SW-Target
Server-Target
```

The diagram also identifies the ICMP flow:

```text
PC-Monitor → Echo Request → Server-Target

PC-Monitor ← Echo Reply ← Server-Target
```

---

## 27. Packet Tracer Project Artifact

The Cisco Packet Tracer project was saved as:

```text
icmp-network-failure-predictor.pkt
```

The final saved version contains the network in its healthy operational state.

Both router interfaces are enabled and the monitored server is reachable from the monitoring workstation.

The failure scenario can be reproduced by executing:

```text
interface gigabitEthernet 0/1
shutdown
```

The healthy state can be restored using:

```text
interface gigabitEthernet 0/1
no shutdown
```

---

## 28. Validation Summary

| Validation | Result |
| --- | --- |
| Physical topology | PASSED |
| IPv4 configuration | PASSED |
| Monitoring subnet | PASSED |
| Monitored subnet | PASSED |
| Default gateways | PASSED |
| Router configuration | PASSED |
| Layer 2 switching | PASSED |
| Layer 3 routing | PASSED |
| Gateway ping | PASSED |
| End-to-end ping | PASSED |
| ICMP Echo Request simulation | PASSED |
| ICMP Echo Reply simulation | PASSED |
| Interface failure simulation | PASSED |
| 100% packet-loss scenario | PASSED |
| Destination unreachable scenario | PASSED |
| Failed Simple PDU visualization | PASSED |
| Interface recovery | PASSED |
| Final 0% packet-loss test | PASSED |

---

## 29. Conclusion

The Cisco Packet Tracer simulation successfully demonstrates the networking concepts that support the ICMP Network Failure Predictor.

The simulation validates:

```text
two distinct IPv4 networks
Layer 2 switching
Layer 3 routing
default gateway behavior
ICMP Echo Request
ICMP Echo Reply
network failure
network recovery
```

The normal scenario demonstrated successful communication between:

```text
192.168.10.10
```

and:

```text
192.168.20.10
```

with stable:

```text
0% packet loss
```

The controlled failure scenario demonstrated:

```text
100% packet loss
```

and:

```text
Destination host unreachable
```

after disabling the router interface connected to the monitored network.

The recovery scenario demonstrated that communication returned after the interface was restored.

The Packet Tracer model therefore provides a clear technical representation of the network conditions that the real ICMP Network Failure Predictor is designed to monitor, classify, store, predict, and present to the user.
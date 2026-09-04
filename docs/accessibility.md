# Accessibility

## ICMP Network Failure Predictor

This document describes the accessibility decisions, implementation practices, and validation activities applied to the mobile interface of the ICMP Network Failure Predictor.

The mobile application was developed using:

```text
React Native
Expo
Expo Router
TypeScript
```

Accessibility was considered throughout the interface design rather than being treated as a final visual adjustment.

The main accessibility objectives are:

```text
Clear information
Predictable navigation
Readable content
Large touch targets
Screen-reader support
Font scaling
Status communication without color dependency
Simple language
Accessible multilingual navigation
```

---

## 1. Accessibility Objective

The application presents technical network information such as:

```text
latency
packet loss
network condition
predictions
alerts
activity recommendations
```

These concepts can be difficult for users without networking knowledge.

For this reason, the interface was designed to reduce cognitive load and present technical information using:

- short labels;
- explanatory text;
- consistent screen structure;
- explicit status names;
- visual hierarchy;
- predictable interactions;
- contextual recommendations.

The objective is to allow a user to understand the current network situation without requiring advanced networking knowledge.

---

## 2. Supported Mobile Screens

Accessibility considerations were applied to the four main application screens:

```text
Overview
History
Forecast
Alerts
```

The application also includes:

```text
Bottom-tab navigation
Language selection modal
Date selector
Time selector
Refresh interactions
Error states
Loading states
Empty states
```

---

## 3. Navigation Structure

The application uses a predictable bottom-tab navigation structure.

Main tabs:

```text
Overview
History
Forecast
Alerts
```

Each tab has:

```text
an icon
a textual label
a consistent location
```

The user does not need to rely on icons alone to understand navigation.

The bottom navigation remains consistent while moving between the major sections of the application.

This reduces cognitive effort and improves predictability.

---

## 4. Touch Target Size

Interactive controls were designed with a minimum touch target of:

```text
48 x 48 dp
```

The project defines:

```typescript
export const touchTarget = {
  minimum: 48,
};
```

This value is used in important interactive elements such as:

```text
language selector
modal close button
date selector
time selector
retry button
period filter controls
```

Larger controls are used for primary actions such as:

```text
Generate Forecast
```

The objective is to reduce interaction errors and make the interface easier to operate for users with motor limitations.

---

## 5. Status Information Does Not Depend Only on Color

The application uses color to reinforce network status, but color is never the only communication method.

The three network states are displayed using explicit textual labels.

### Healthy Network

```text
OK
Network is stable
```

### Degraded Network

```text
RISK
Network degradation detected
```

### Unavailable Network

```text
FAILURE
Network unavailable
```

The Portuguese interface uses:

```text
OK
RISCO
FALHA
```

The Spanish interface uses equivalent textual labels.

Therefore, a user who cannot distinguish the status colors can still understand the network condition through text.

---

## 6. Status Color System

The interface uses semantic colors to reinforce status information.

Conceptually:

```text
OK
→ success color

RISK
→ warning color

FAILURE
→ danger color
```

The colors are accompanied by:

```text
status text
descriptive message
border treatment
badge text
```

The same principle is used for activity recommendations.

---

## 7. Activity Recommendation Accessibility

The Forecast screen provides recommendations for:

```text
Videoconference
Streaming
Online gaming
Web browsing
File upload
```

Recommendation states are explicitly displayed as:

```text
RECOMMENDED
CAUTION
NOT_RECOMMENDED
```

The interface does not depend only on green, yellow, or red coloring.

Each recommendation includes:

```text
activity name
recommendation status
descriptive explanation
icon
```

Example:

```text
Videoconference

Recommended

The predicted connection should be suitable
for video conferences.
```

This improves understanding for users who cannot interpret status colors.

---

## 8. Accessible Language

The interface avoids exposing raw backend terminology when a clearer user-facing expression is available.

Technical values remain visible when relevant, such as:

```text
5 ms
0% packet loss
```

but they are accompanied by descriptions such as:

```text
Latency
Response time
Packet loss
Packets lost
```

Network conditions are also explained using user-oriented text.

Example:

```text
Network is stable

No significant connectivity issues were
detected in the latest measurement.
```

This reduces the need for the user to understand low-level networking concepts.

---

## 9. Internationalization

The mobile application supports three languages:

```text
English
Portuguese
Spanish
```

The selected language is persisted using:

```text
AsyncStorage
```

Storage key:

```text
@network-monitor/language
```

The stored language is restored when the application is opened again.

---

## 10. Explicit Language Selector

The initial interface used a language-cycling button.

The final interface uses an explicit language selector to reduce unnecessary interactions.

The selector displays:

```text
English
EN

Português
PT-BR

Español
ES
```

The user can select the desired language directly instead of cycling through multiple options.

This improves:

```text
predictability
discoverability
motor accessibility
cognitive accessibility
```

---

## 11. Language Selector Accessibility

The language selector uses accessibility roles and state information.

The main language control is exposed as:

```text
accessibilityRole="button"
```

Language options use:

```text
accessibilityRole="radio"
```

and expose the current selection through:

```text
accessibilityState={{
  checked: selected
}}
```

The selector is displayed using a modal interface.

The modal includes:

```text
explicit title
language names
language codes
selected state
close control
```

The selected language is therefore represented visually and semantically.

---

## 12. Screen-Reader Support

Important interface components include React Native accessibility information such as:

```text
accessible
accessibilityLabel
accessibilityRole
accessibilityState
accessibilityHint
```

Examples include:

```text
network status cards
latency cards
packet-loss cards
prediction cards
recommendation cards
language selector
period filters
retry actions
```

This allows compatible assistive technologies such as Android TalkBack and iOS VoiceOver to receive semantic information instead of depending only on visual layout.

---

## 13. Network Status Screen-Reader Information

The Overview screen combines multiple visual elements into meaningful accessibility labels.

Conceptually, a network status card can be exposed as:

```text
Current status:
Network is stable.

No significant connectivity issues were
detected in the latest measurement.
```

This avoids requiring a screen-reader user to interpret several disconnected decorative elements.

---

## 14. Measurement Accessibility

Latency and packet-loss cards contain explicit accessibility labels.

Example:

```text
Latency:
5 milliseconds
```

and:

```text
Packet loss:
0 percent
```

The visual unit:

```text
ms
```

is translated into a meaningful spoken value through the accessibility label where appropriate.

---

## 15. History Accessibility

The History screen presents network information using both visual and textual formats.

The screen contains:

```text
summary cards
charts
recent measurements
status badges
timestamps
```

The user does not need to interpret the charts alone.

Important statistics are also displayed as text:

```text
Average latency
Minimum latency
Maximum latency
Average packet loss
Number of measurements
```

This provides an alternative representation of the visual trend information.

---

## 16. Accessible Chart Information

The custom network line chart includes an accessibility summary.

Instead of relying exclusively on the line graph, the component can communicate:

```text
chart title
average value
minimum value
maximum value
unit
```

Conceptually:

```text
Latency trend.
Average 5.20 milliseconds.
Minimum 4.25 milliseconds.
Maximum 7.10 milliseconds.
```

This improves access to chart information for users who cannot visually inspect the graph.

---

## 17. Forecast Accessibility

The Forecast screen contains accessible controls for:

```text
date selection
time selection
forecast generation
prediction result
activity recommendations
```

Primary actions use descriptive text instead of icon-only interaction.

Examples:

```text
Change date
Change time
Generate forecast
```

Icons are used only as additional visual reinforcement.

---

## 18. Recommendation Screen-Reader Information

Each activity recommendation is grouped into a meaningful accessibility unit.

A recommendation can be interpreted conceptually as:

```text
Videoconference.
Recommended.
The predicted connection should be suitable
for video conferences.
```

The user therefore receives:

```text
activity
recommendation level
reason
```

without depending on layout or color.

---

## 19. Alerts Accessibility

The Alerts screen communicates severity through:

```text
icon
color
title
description
read state
timestamp
```

Example warning:

```text
Network degradation detected

Network quality has degraded and some
activities may be affected.
```

Example critical alert:

```text
Network failure detected

The monitored connection became unavailable
or experienced a critical failure.
```

This avoids relying exclusively on warning or danger colors.

---

## 20. Empty States

The application provides explicit empty states instead of showing blank screens.

Examples include:

```text
No measurements available
No prediction available
No active alerts
No measurements were found for the selected period
```

These messages help users understand that the interface is functioning even when data is unavailable.

---

## 21. Loading States

Network operations may require time to complete.

The application displays explicit loading feedback such as:

```text
Loading network data...
Generating forecast...
```

An ActivityIndicator is used together with textual information.

The application therefore does not rely only on animation to communicate progress.

---

## 22. Error States

Connection errors are presented using visible textual information.

Example:

```text
Unable to connect to the monitoring service.

Check whether the API is running and the
phone is connected to the same network as
the server.
```

Where appropriate, the interface also presents a:

```text
Retry
```

button.

The error interface includes:

```text
descriptive title
explanation
clear recovery action
```

---

## 23. Pull-to-Refresh

The Overview, History, and Alerts screens support pull-to-refresh behavior.

This allows users to request updated information without navigating away from the current screen.

The Overview refresh behavior was validated using a real backend measurement.

The process was:

```text
Generate new ICMP measurement
        ↓
Pull Overview screen downward
        ↓
Loading indicator appears
        ↓
Latest measurement retrieved
        ↓
Updated latency displayed
```

This confirmed that refresh feedback corresponds to a real API request.

---

## 24. Font Scaling

The application uses React Native text components that support the operating system's font scaling behavior.

The interface was manually tested using an increased Android system font size.

The objective was to verify that:

```text
text remained readable
content remained scrollable
important information remained accessible
screens did not become unusable
```

The four main screens remained usable during the performed font-size validation.

---

## 25. Scrollable Layouts

Main screens use:

```text
ScrollView
```

where required.

This is especially important when:

```text
system font size is increased
content is translated into longer text
multiple measurements are displayed
recommendations are displayed
alerts are displayed
```

The user can continue reaching content that extends beyond the visible screen.

---

## 26. Safe Area Handling

The mobile application uses:

```text
react-native-safe-area-context
```

instead of relying on deprecated SafeArea behavior.

The main screens use:

```text
SafeAreaView
```

from:

```text
react-native-safe-area-context
```

This helps prevent important interface elements from conflicting with:

```text
status bars
device cutouts
screen edges
```

---

## 27. Predictable Visual Hierarchy

The four major screens follow a similar visual structure.

Typical structure:

```text
Application label
        ↓
Screen title
        ↓
Description
        ↓
Primary content
        ↓
Supporting information
```

Examples:

```text
NETWORK MONITOR

Connection Overview

Monitor network quality and anticipate
connectivity issues.
```

and:

```text
NETWORK MONITOR

Network History

Review how latency, packet loss and network
condition changed over time.
```

Consistent structure reduces learning effort when users change screens.

---

## 28. Contrast Strategy

The application uses a dark interface with high-contrast foreground text.

Main visual roles include:

```text
dark background
light primary text
secondary gray text
bright primary accent
semantic success color
semantic warning color
semantic danger color
```

The project accessibility requirements use the following contrast targets:

```text
Normal text:
4.5:1

Large text and graphical elements:
3:1
```

The interface was designed around these targets.

A dedicated automated contrast measurement tool has not been used as part of the current validation process.

Formal contrast measurement remains an appropriate final verification activity if certification-level accessibility validation is required.

---

## 29. Cognitive Load Reduction

The interface intentionally avoids presenting excessive raw networking information on the primary screens.

For example, Overview focuses on:

```text
current status
latency
packet loss
prediction
```

instead of displaying:

```text
raw ICMP command output
routing tables
packet headers
MAC addresses
```

Technical details remain available through the backend and development tools but are not required for normal mobile usage.

This makes the application easier to understand for non-specialist users.

---

## 30. Consistent Status Terminology

The same internal status concepts are used throughout the application:

```text
OK
RISK
FAILURE
```

They affect:

```text
current measurement
history
prediction
alerts
recommendations
```

The user therefore learns one consistent status model.

The interface translates the user-facing labels while preserving the same semantic meaning.

---

## 31. Accessibility and Internationalization

Accessibility behavior is maintained across the three supported languages.

The language system translates:

```text
navigation labels
screen titles
descriptions
network status
history labels
forecast labels
alert labels
activity names
recommendation states
recommendation descriptions
```

Recommendation descriptions were moved to the mobile internationalization layer so they can be presented in the user's selected language.

This prevents a partially translated interface.

---

## 32. Responsive Content

The mobile layout uses flexible containers such as:

```text
flex
flexWrap
ScrollView
percentage-based cards
dynamic window dimensions
```

For example, the History chart uses the current window width rather than a fixed screen width.

This helps the application adapt to different mobile display sizes.

---

## 33. Accessibility Validation Performed

The current prototype has been manually reviewed for:

| Accessibility Area | Status |
| --- | --- |
| Minimum touch targets | Implemented |
| Textual status identification | Implemented |
| Information not dependent only on color | Implemented |
| Large-font usability | Manually validated |
| Scrollable content | Manually validated |
| Predictable navigation | Implemented |
| Safe-area handling | Implemented |
| Explicit language selection | Implemented |
| Accessibility labels | Implemented |
| Accessibility roles | Implemented |
| Accessibility states | Implemented |
| Chart textual alternatives | Implemented |
| Loading text | Implemented |
| Error descriptions | Implemented |
| Empty states | Implemented |
| Three-language interface | Manually validated |

---

## 34. Screen-Reader Validation Status

The application contains semantic information intended for technologies such as:

```text
Android TalkBack
Apple VoiceOver
```

Accessibility labels, roles, hints, and selected states are implemented throughout important controls and information cards.

A full formal screen-reader audit across multiple operating systems and assistive-technology versions is outside the current prototype validation scope.

This is different from saying the application has no screen-reader support.

The current prototype includes the implementation foundation required for screen-reader navigation, while broader assistive-technology certification would require a dedicated validation cycle.

---

## 35. Accessibility Limitations

The current prototype still has opportunities for future accessibility improvements.

Examples include:

```text
formal automated contrast verification
complete TalkBack navigation audit
complete VoiceOver navigation audit
focus-order testing across all screens
accessibility testing on multiple screen sizes
accessibility testing on multiple Android versions
accessibility testing on iOS hardware
keyboard navigation validation for web usage
```

These are future validation improvements rather than blockers for the current functional prototype.

---

## 36. Accessibility Principles Applied

The project follows the following practical principles:

```text
Do not rely only on color.

Use text together with icons.

Use large interaction areas.

Explain technical information.

Provide visible loading feedback.

Provide visible error feedback.

Provide empty-state messages.

Maintain predictable navigation.

Allow operating-system font scaling.

Use scrollable layouts.

Provide semantic labels for assistive technologies.

Allow direct language selection.

Keep user-facing terminology consistent.
```

---

## 37. Relationship to Project Requirements

The accessibility implementation supports the project requirements related to:

```text
low cognitive load
TalkBack / VoiceOver compatibility
status information without color dependency
font scaling
minimum touch targets
predictable navigation
clear network terminology
accessible interaction
```

The implemented mobile architecture supports these requirements through reusable:

```text
theme constants
language context
accessibility labels
semantic status functions
responsive layouts
safe-area handling
```

---

## 38. Final Accessibility Status

The current mobile prototype provides:

```text
Accessible navigation structure           ✅
Minimum 48 dp touch targets               ✅
Status text independent of color          ✅
Activity status independent of color      ✅
Font scaling support                      ✅
Large-font manual validation              ✅
Scrollable layouts                        ✅
Safe-area support                         ✅
Explicit language selector                ✅
English interface                         ✅
Portuguese interface                      ✅
Spanish interface                         ✅
Accessibility labels                      ✅
Accessibility roles                       ✅
Accessibility states                      ✅
Loading feedback                          ✅
Error feedback                            ✅
Empty-state feedback                      ✅
Chart textual summary                     ✅
Screen-reader implementation support      ✅
Formal multi-device screen-reader audit   Future work
Formal automated contrast audit           Future work
```

---

## 39. Conclusion

Accessibility is integrated into the ICMP Network Failure Predictor mobile interface as part of the product design.

The application does not require users to interpret network conditions based only on color.

Important information is communicated using:

```text
text
icons
status labels
descriptions
semantic accessibility information
```

The application also supports:

```text
large touch targets
font scaling
scrollable content
three languages
explicit language selection
safe areas
accessible charts
predictable navigation
```

Manual validation confirmed that the interface remains usable with increased Android system font size.

The prototype also includes accessibility labels, roles, hints, and selected states designed for assistive-technology compatibility.

Future work may extend the current validation with:

```text
formal TalkBack testing
formal VoiceOver testing
automated contrast analysis
multi-device accessibility testing
web keyboard-navigation testing
```

The current implementation provides a strong accessibility foundation while maintaining a simple, modern, and understandable network-monitoring interface.
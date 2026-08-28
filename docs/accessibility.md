# Accessibility Guidelines

Accessibility is treated as a core system requirement rather than a final-stage improvement.

The mobile application will be designed considering the accessibility requirements defined for the project.

## Screen Readers

Essential functionality must be usable with:

- Android TalkBack
- iOS VoiceOver

Interactive components must expose meaningful:

- names
- roles
- states
- values

## Color Independence

Connectivity information must never rely exclusively on color.

Incorrect example:

- Green
- Yellow
- Red

Correct example:

- ✓ Good
- ⚠ Risk of instability
- ✕ Connection failure

Color may reinforce information but must not be the only method of communication.

## Contrast

Interface colors must maintain appropriate contrast between text, controls and backgrounds.

Target:

- Normal text: at least 4.5:1
- Large text: at least 3:1
- Essential graphical components: at least 3:1

## Text Scaling

The application must support operating-system font scaling.

Increasing text size must not:

- hide information
- overlap components
- truncate essential content
- block important actions

## Interaction

Essential functionality must not require complex gestures.

Users must be able to perform actions through conventional accessible controls.

Target minimum touch area: **48 × 48 dp**

## Language

The interface should use simple language.

Technical network concepts should include contextual explanations.

### Latency

The time required for data to travel through the network and return.

### Packet Loss

The percentage of network packets that fail to reach their destination.

## Navigation

Navigation should be:

- logical
- consistent
- predictable

Screen transitions and dynamic changes must preserve context for assistive technologies.

## Accessibility Testing Checklist

Before release:

- [ ] Test main flow using TalkBack
- [ ] Test main flow using VoiceOver when available
- [ ] Verify text scaling
- [ ] Verify color independence
- [ ] Verify contrast
- [ ] Verify touch target size
- [ ] Verify logical focus order
- [ ] Verify accessible labels
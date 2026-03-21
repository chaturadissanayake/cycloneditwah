# Cyclone Ditwah

## Project: The Island Submerged

This repository contains the source code for **The Island Submerged**, a forensic investigative data story detailing the impact of Cyclone Ditwah on Sri Lanka. The project utilises "scrollytelling" to document the systemic collapse of infrastructure, the displacement of citizens, and critical gaps in recovery following the events of November 2025.

---

## Key Narrative Components

The story is structured to guide the reader through several critical impact zones:

* **The Collapse Timeline**: A 14-frame visual sequence illustrating the failure of structural infrastructure.
* **Highland Collapse**: Documentation of 200+ active landslide zones and 206 blocked transit routes.
* **Education Paralysis**: An analysis of how 555,609 students were cut off from schooling as 1,382 schools were repurposed for survival.
* **Agricultural Ruin**: Data on the destruction of 148,410 hectares of cultivated land during the Maha season.
* **The Funding Gap**: A comparison of the $35M required funding versus the ~$23M received aid.

---

## Technical Features

Built for high-performance visual storytelling, the site incorporates the following:

* **GSAP & ScrollTrigger**: Handles all narrative reveal animations and the immersive pinned scroll sequences.
* **Interactive Comparison Slider**: Allows users to swipe between "before" and "after" states of landslide-affected villages.
* **Dynamic Counter Engine**: Staggered animation of key metrics as they enter the viewport.
* **Map Carousel & Lightbox**: A native JavaScript implementation for exploring the storm's chronology across Southern, Central, and Northern phases.
* **Responsive Architecture**: Custom media queries designed to handle complex visual assets on portrait mobile devices.

---

## Design System

The visual identity is defined by an editorial palette intended to reflect the gravity of the disaster:

| Element | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Background** | #F9F7F2 | Primary canvas color for readability. |
| **Text Primary** | #1A1A1A | High-contrast black for body copy and headings. |
| **Accent** | #005A87 | Used for progress bars, drop caps, and key interactive elements. |
| **Crisis** | #B33F2E | Reserved for highlight metrics and urgent data. |
| **Muted** | #8C7355 | Used for secondary metadata and bylines. |
| **Alt Background** | #E8E3D5 | Section dividers and data breakout bands. |

### Typography
* **Headings**: Playfair Display (900 Weight) for authoritative editorial titles.
* **Body**: Public Sans (18px) with a 1.5 line-height for optimal reading flow.

---

## Authors and Methodology

**Story and Design**: Chatura Dissanayake
**Editing**: Imali Nillekumbura

**Data Sources**:
* Disaster Management Centre (DMC) Spatial Records.
* RAPIDA Executive Summary Assessments.
* UN OCHA Situation Reports.
* Ministry of Agriculture Land Audit.

---

## Development

The project is structured as a lightweight front-end application:

1. `index.html`: Contains the narrative structure and metadata.
2. `style.css`: Contains the design system and layout logic.
3. `script.js`: Contains the animation and interactivity logic.

All information is verified as of March 06, 2026.

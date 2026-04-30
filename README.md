# Cyclone Ditwah — Humanitarian Impact Dataset

This is the data that sits behind the story **"How a Single Storm Broke Sri Lanka."**

Cyclone Ditwah made landfall on Sri Lanka's eastern coast on November 28, 2025. What followed was months of displacement, a funding effort that ran out of steam, and a recovery that, for many families, never really arrived. This dataset tracks all of that — from the first emergency estimates on November 29 through to the final situation report on March 6.

If you want to understand what the numbers actually represent, [read the full investigation here](https://cycloneditwah.vercel.app).

---

## What's in here

The dataset is a single Excel workbook with four sheets. Each one captures a different slice of the crisis.

**Macro Impact** — How many people were affected, and how many homes were damaged, tracked across 14 reporting dates. The affected population grew from 800,000 on day one to a peak of 2.3 million once roads cleared and rescue teams could finally reach cut-off areas.

**Displacement** — Where people actually went. In the early weeks, hundreds of thousands sheltered in government safety centres. By January, those centres started closing — and families had no choice but to move in with neighbours, relatives, and strangers. This sheet tracks both sides of that shift.

**Human Toll** — Confirmed deaths, missing persons, and the number of active relief centres still running at each reporting date. Casualties rose to 646 and then stopped being updated, which is its own kind of data point.

**Funding** — Who gave money, how much, and whether it went through the official Humanitarian Programme Plan (HPP) or bypassed it entirely. 33 donors contributed across governments, UN agencies, and private foundations. The HPP is the coordinated framework meant to direct aid where it's needed most — but a significant portion of donations went around it.

---

## The numbers that matter

| | |
|---|---|
| People affected at peak | 2,300,000 |
| Homes damaged | 120,435 |
| Lives lost | 646 |
| Still missing | 173 |
| Peak shelter occupancy | 218,526 people in a single night |
| Relief centres at peak | 1,564 |
| Relief centres by March | 32 |
| Total donors | 33 |
| Raised inside the HPP | ~$18.9M USD |
| Raised outside the HPP | ~$17.1M USD |
| Total funding gap | ~$12.8M USD short of the $35.3M goal |

---

## Using the data

You'll need Python with `pandas` and `openpyxl` to load the workbook.

```bash
pip install pandas openpyxl
```

```python
import pandas as pd

xl = pd.read_excel("cyclone_ditwah_dataset.xlsx", sheet_name=None)

macro      = xl["Macro Impact"]
displacement = xl["Displacement"]
human_toll = xl["Human Toll"]
funding    = xl["Funding"]
```

A few things worth knowing before you start:

- Dates are stored as strings in `DD-Mon` format (e.g. `29-Nov`, `06-Mar`). You'll want to parse those manually if you're doing time-series work.
- **Affected People** and **Houses Damaged** are cumulative totals, not weekly additions. **Displacement** and **Active Centres** are point-in-time snapshots.
- The host family figures (`With Host Families`) only begin from December 30. Before that date, the government wasn't formally tracking that category — not because it wasn't happening, but because no one was counting yet.

---

## Sources

The data in this workbook was compiled from official UN OCHA Situation Reports published between November 2025 and March 2026, cross-referenced with DMC (Disaster Management Centre) field reports and the World Bank GRADE damage assessment. The funding breakdown reflects donor-reported figures as submitted to the HPP tracking system.

---

## Cite this dataset

> Dissanayake, C. & Nillekumbura, I. (2026). *Cyclone Ditwah Humanitarian Impact Dataset*. Retrieved from [https://cycloneditwah.vercel.app](https://cycloneditwah.vercel.app)

---

## Questions or corrections

If you spot something wrong in the data or want to discuss the methodology, reach out at [consultchatura@gmail.com](mailto:consultchatura@gmail.com).

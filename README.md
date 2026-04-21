# 🌀 Cyclone Ditwah Humanitarian Dataset

A structured dataset documenting the humanitarian impact, displacement patterns, human toll, and international funding response to **Cyclone Ditwah**, covering the period from **November 29 through March 6**.

---

## 📁 Dataset Overview

The dataset is contained in a single Excel workbook (`cyclone_ditwah_dataset.xlsx`) with **four sheets**, each capturing a distinct dimension of the cyclone's aftermath.

| Sheet | Description | Records |
|---|---|---|
| `Macro Impact` | Affected population & housing damage over time | 14 |
| `Displacement` | People in safety centres vs. with host families | 14 |
| `Human Toll` | Casualties, missing persons & active relief centres | 14 |
| `Funding` | Donor contributions inside and outside the Humanitarian Programme Plan (HPP) | 18 |

---

## 📊 Sheet Descriptions

### 1. Macro Impact
Tracks the broadening scale of the disaster over time.

| Column | Type | Description |
|---|---|---|
| `Date` | String | Reporting date (DD-Mon format) |
| `Affected People` | Integer | Cumulative count of people affected |
| `Houses Damaged` | Integer | Cumulative count of houses damaged |

> Peak affected population: **2,300,000 people**
> Peak houses damaged: **120,435**

---

### 2. Displacement
Monitors how displaced persons were sheltered as the crisis evolved.

| Column | Type | Description |
|---|---|---|
| `Date` | String | Reporting date (DD-Mon format) |
| `In Safety Centres` | Integer | People sheltered in formal safety/evacuation centres |
| `With Host Families` | Integer | People sheltered with host families in the community |

> Host family data begins from **30-Dec**, reflecting a transition away from formal centres as the acute emergency phase subsided.

---

### 3. Human Toll
Records the human cost of the disaster and the operational status of relief centres.

| Column | Type | Description |
|---|---|---|
| `Date` | String | Reporting date (DD-Mon format) |
| `Casualties` | Integer | Confirmed deaths |
| `Missing Persons` | Integer | Persons still unaccounted for |
| `Active Centres` | Integer | Number of active relief/evacuation centres operational |

> Total confirmed casualties: **646** | Missing persons (final): **173**
> Active centres declined from a peak of **1,564** to **32** by March 6.

---

### 4. Funding
Documents financial contributions from international donors, split by whether funds were directed inside or outside the Humanitarian Programme Plan (HPP).

| Column | Type | Description |
|---|---|---|
| `Donor` | String | Name of the donor country, UN agency, or organisation |
| `Inside HPP (USD)` | Integer | Funds contributed within the Humanitarian Programme Plan |
| `Outside HPP (USD)` | Integer | Funds contributed outside the Humanitarian Programme Plan |

> **18 donors** contributed, including governments, multilateral institutions, and foundations.
> Largest single contributions: **UN CERF** ($4.5M inside HPP), **Saudi Fund** ($6M outside HPP), **USA** ($3M inside HPP), **Japan** ($2.5M inside HPP).

---

## 🗂️ File Structure

```
cyclone_ditwah_dataset.xlsx
├── Macro Impact        # Scale of disaster over time
├── Displacement        # Shelter and displacement tracking
├── Human Toll          # Deaths, missing persons, active centres
└── Funding             # International donor contributions (USD)
```

---

## 🚀 Getting Started

### Prerequisites
```bash
pip install pandas openpyxl
```

### Load the Dataset
```python
import pandas as pd

xl = pd.read_excel("cyclone_ditwah_dataset.xlsx", sheet_name=None)

macro      = xl["Macro Impact"]
displace   = xl["Displacement"]
human_toll = xl["Human Toll"]
funding    = xl["Funding"]
```

### Quick Summary
```python
# Total funding raised
total_funding = funding["Inside HPP (USD)"].sum() + funding["Outside HPP (USD)"].sum()
print(f"Total funding: ${total_funding:,.0f}")

# Peak displacement in safety centres
print(f"Peak in safety centres: {displace['In Safety Centres'].max():,}")

# Final casualty count
print(f"Total casualties: {human_toll['Casualties'].iloc[-1]:,}")
```

---

## 📈 Key Statistics

| Metric | Value |
|---|---|
| Total people affected | 2,300,000 |
| Total houses damaged | 120,435 |
| Confirmed casualties | 646 |
| Missing persons | 173 |
| Peak safety centre occupancy | 218,526 |
| Peak active relief centres | 1,564 |
| Total donors | 18 |
| Total funding (Inside HPP) | ~$18.9M USD |
| Total funding (Outside HPP) | ~$17.1M USD |

---

## 📌 Notes

- **Date format**: Dates are stored as strings in `DD-Mon` format (e.g., `29-Nov`, `06-Mar`) and span a single cyclone season. Year context should be inferred from external documentation.
- **HPP**: The Humanitarian Programme Plan is a coordinated framework used by humanitarian actors to allocate and track aid.
- **Cumulative vs. snapshot values**: `Affected People` and `Houses Damaged` are cumulative; `In Safety Centres`, `With Host Families`, and `Active Centres` are point-in-time snapshots.

---

## 🤝 Contributing

Contributions to enrich or extend this dataset (e.g., district-level breakdowns, sectoral response data, or timeline corrections) are welcome. Please open an issue or submit a pull request.

---

## 📄 License

This dataset is intended for humanitarian research and analysis purposes. Please cite appropriately if used in publications or reports.

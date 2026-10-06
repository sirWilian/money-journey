# Domain Glossary — Money Journey

Terms used in code and documentation. Keep in sync with AGENTS.md naming.

## Coast FIRE Number
The amount that must be invested **today** so that compound growth alone — with zero further contributions — reaches the FI Target by the target retirement age. The calculator uses the real return rate (nominal minus inflation) to discount the FI Target back to present value.

**Code**: `coastNumber` / `result.coastNumber`

## FI Target
The total portfolio needed at retirement to sustain annual spending indefinitely. Equals `Annual Spending ÷ SWR`. Equivalent to `annualSpending × (100 / swr)` (the "multiple").

**Code**: `fiTarget` / `result.fiTarget`

## Contribution Phase
A defined span of time (in months) during which a fixed monthly amount is contributed to the portfolio. The Coast FIRE calculator supports multiple sequential phases, each with its own duration and contribution amount.

**Code**: `period` — `{ id, durationMonths, monthlyContribution }`

## Real Return Rate
The nominal annual return rate minus the inflation rate. Used for inflation-adjusted calculations so that all portfolio values are expressed in today's purchasing power.

**Code**: `realRateM` (monthly, compounded via Fisher equation)

## Safe Withdrawal Rate (SWR)
The annual percentage of the portfolio withdrawn in retirement. Determines the FI Target multiplier (`1 / SWR`). Default: 4%.

**Code**: `swr` (stored as a percentage, e.g. `4.0`)

## Expense / Transaction
A financial movement: either income (positive) or an outgoing (negative). Stored in the `expenses` database table.

**Code**: `Expense` model — `{ id, name, category, amount, is_income, created_at }`

## Balance Record
_(planned)_ A snapshot of total portfolio value at a point in time. Used to track net worth over time.

**Code**: `BalanceRecord` model

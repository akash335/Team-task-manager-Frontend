
-- Index Rationale
-- 1) (account_id, txn_ts): accelerates per-account time-ordered scans (balances, velocity, EoM).
-- 2) (txn_type, txn_ts): accelerates month/period aggregations by type.
-- 3) (account_id, txn_ts, channel): helps structuring (filters channel then scans narrow range).
-- 4) Accounts(customer_id) & Loans(customer_id): common join paths for customer 360 reports.

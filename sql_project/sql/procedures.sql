
-- P1: Transaction-safe transfer (pseudo, as SQLite has no stored procs)
-- BEGIN TRANSACTION;
-- -- lock rows (in Oracle/PG: SELECT ... FOR UPDATE on balance snapshot table)
-- -- 1) Validate source balance >= amount
-- -- 2) INSERT DR txn for source; INSERT CR txn for destination (same batch_id/ts)
-- -- 3) Update balances snapshot (if maintained)
-- -- 4) COMMIT;
-- -- On any error: ROLLBACK;

-- P2: Month-close rollup (materialize into summary table)
-- CREATE TABLE IF NOT EXISTS monthly_rollup (...);
-- INSERT INTO monthly_rollup
-- SELECT account_id, yyyymm, cr, dr, net FROM monthly_account_summary WHERE yyyymm=<target>;

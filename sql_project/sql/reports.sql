
-- R1: Branch-wise net inflow for the last full month
WITH last_full_month AS (
  SELECT DATE('now','start of month','-1 day') AS last_month_end,
         DATE('now','start of month','-1 month') AS last_month_start
),
tx AS (
  SELECT t.*, a.branch_id
  FROM transactions t
  JOIN accounts a ON a.account_id = t.account_id
  JOIN last_full_month m
    ON DATE(t.txn_ts) >= m.last_month_start AND DATE(t.txn_ts) <= m.last_month_end
)
SELECT b.branch_id, b.city,
       SUM(CASE WHEN txn_type='CR' THEN amount ELSE 0 END) AS total_cr,
       SUM(CASE WHEN txn_type='DR' THEN amount ELSE 0 END) AS total_dr,
       ROUND(SUM(CASE WHEN txn_type='CR' THEN amount ELSE -amount END),2) AS net_inflow
FROM tx
JOIN branches b ON b.branch_id = tx.branch_id
GROUP BY b.branch_id, b.city
ORDER BY net_inflow DESC;

-- R2: Dormant accounts in last 90 days
SELECT a.account_id, cu.full_name, b.city
FROM accounts a
JOIN customers cu ON cu.customer_id=a.customer_id
JOIN branches b ON b.branch_id=a.branch_id
LEFT JOIN transactions t
  ON t.account_id=a.account_id AND DATE(t.txn_ts) >= DATE('now','-90 days')
WHERE t.txn_id IS NULL AND a.status!='CLOSED'
ORDER BY b.city, a.account_id;

-- R3: Structuring alerts (>=3 cash deposits under 50k on same day; sum >= 1.2 lakh)
WITH cash_deposits AS (
  SELECT a.customer_id, DATE(t.txn_ts) AS d,
         SUM(t.amount) AS total_amt, COUNT(*) AS cnt
  FROM transactions t
  JOIN accounts a ON a.account_id = t.account_id
  WHERE t.txn_type='CR' AND t.channel='CASH' AND t.amount < 50000
  GROUP BY a.customer_id, DATE(t.txn_ts)
)
SELECT cu.customer_id, cu.full_name, d, total_amt, cnt
FROM cash_deposits c
JOIN customers cu ON cu.customer_id=c.customer_id
WHERE cnt >= 3 AND total_amt >= 120000
ORDER BY d DESC;

-- R4: Salary credits per customer by month
SELECT cu.customer_id, cu.full_name,
       strftime('%Y-%m', t.txn_ts) AS yyyymm,
       SUM(t.amount) AS salary_credits
FROM customers cu
JOIN accounts a ON a.customer_id=cu.customer_id
JOIN transactions t ON t.account_id=a.account_id
WHERE t.txn_type='CR' AND (t.channel IN ('NEFT','NETBANK') OR t.merchant_category='SALARY')
GROUP BY cu.customer_id, cu.full_name, strftime('%Y-%m', t.txn_ts)
ORDER BY cu.customer_id, yyyymm;

-- R5: High-velocity (any 10-min window with >10 txns)
WITH t AS (
  SELECT account_id, txn_ts FROM transactions
),
pairs AS (
  SELECT t1.account_id, t1.txn_ts AS start_ts,
         COUNT(*) AS cnt_in_10m
  FROM t t1 JOIN t t2
    ON t1.account_id = t2.account_id
   AND datetime(t2.txn_ts) BETWEEN datetime(t1.txn_ts) AND datetime(t1.txn_ts, '+10 minutes')
  GROUP BY t1.account_id, t1.txn_ts
)
SELECT account_id, start_ts, cnt_in_10m
FROM pairs
WHERE cnt_in_10m > 10
ORDER BY cnt_in_10m DESC;

-- R6: Potential NPA/overdue loans (>=90 days)
SELECT l.loan_id, cu.full_name, l.loan_type, l.principal, l.overdue_days, l.status
FROM loans l JOIN customers cu ON cu.customer_id=l.customer_id
WHERE l.overdue_days >= 90
ORDER BY l.overdue_days DESC;

-- R7: Top Merchant categories by spend in last 90 days
WITH recent AS (
  SELECT * FROM transactions
  WHERE txn_type='DR' AND merchant_category IS NOT NULL
    AND DATE(txn_ts) >= DATE('now','-90 days')
)
SELECT merchant_category, ROUND(SUM(amount),2) AS spend
FROM recent
GROUP BY merchant_category
ORDER BY spend DESC
LIMIT 10;

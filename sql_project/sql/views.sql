
CREATE VIEW IF NOT EXISTS monthly_account_summary AS
SELECT a.account_id,
       strftime('%Y-%m', t.txn_ts) AS yyyymm,
       SUM(CASE WHEN t.txn_type='CR' THEN t.amount ELSE 0 END) AS cr,
       SUM(CASE WHEN t.txn_type='DR' THEN t.amount ELSE 0 END) AS dr,
       SUM(CASE WHEN t.txn_type='CR' THEN t.amount ELSE -t.amount END) AS net
FROM accounts a
LEFT JOIN transactions t ON t.account_id=a.account_id
GROUP BY a.account_id, strftime('%Y-%m', t.txn_ts);

CREATE VIEW IF NOT EXISTS account_current_balance AS
SELECT a.account_id,
       ROUND(SUM(CASE WHEN t.txn_type='CR' THEN t.amount ELSE -t.amount END),2) AS balance
FROM accounts a
LEFT JOIN transactions t ON t.account_id=a.account_id
GROUP BY a.account_id;

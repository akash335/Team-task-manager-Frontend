
PRAGMA foreign_keys = ON;

CREATE TABLE branches (
  branch_id INTEGER PRIMARY KEY,
  city TEXT NOT NULL,
  ifsc TEXT UNIQUE NOT NULL
);

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  pan TEXT UNIQUE NOT NULL,
  kyc_status TEXT NOT NULL CHECK (kyc_status IN ('PENDING','VERIFIED','REJECTED')),
  city TEXT NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE accounts (
  account_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  branch_id INTEGER NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('SAVINGS','CURRENT','SALARY')),
  opened_at DATETIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','DORMANT','CLOSED')),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

CREATE TABLE transactions (
  txn_id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  txn_ts DATETIME NOT NULL,
  amount NUMERIC NOT NULL,
  txn_type TEXT NOT NULL CHECK (txn_type IN ('CR','DR')),
  channel TEXT NOT NULL,
  merchant_category TEXT,
  counterparty_account_id INTEGER,
  FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE cards (
  card_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('VISA','MASTERCARD','RUPAY')),
  credit_limit NUMERIC NOT NULL,
  opened_at DATETIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','BLOCKED','CLOSED')),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE loans (
  loan_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('HOME','AUTO','PERSONAL','EDUCATION','CREDIT_CARD')),
  principal NUMERIC NOT NULL,
  issued_at DATETIME NOT NULL,
  interest_rate NUMERIC NOT NULL,
  emi_amount NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','CLOSED','NPA')),
  overdue_days INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Indexes
CREATE INDEX idx_txn_account_ts ON transactions(account_id, txn_ts);
CREATE INDEX idx_txn_type_time ON transactions(txn_type, txn_ts);
CREATE INDEX idx_accounts_customer ON accounts(customer_id);
CREATE INDEX idx_loans_customer ON loans(customer_id);

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("./data/database.db");
export const db = drizzle(sqlite, { schema });

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS owners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    store_name TEXT NOT NULL,
    store_address TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    permissions TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    admin_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    national_id TEXT,
    credit_limit REAL NOT NULL DEFAULT 0,
    current_debt REAL NOT NULL DEFAULT 0,
    total_paid REAL NOT NULL DEFAULT 0,
    rating TEXT,
    "group" TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    is_blacklisted INTEGER NOT NULL DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    category TEXT,
    payment_method TEXT,
    receipt_number TEXT,
    due_date INTEGER,
    paid_date INTEGER,
    status TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date INTEGER NOT NULL,
    expiry_date INTEGER NOT NULL,
    max_admins INTEGER NOT NULL DEFAULT 1,
    max_staff INTEGER NOT NULL DEFAULT 5,
    max_customers INTEGER NOT NULL DEFAULT 100,
    features TEXT NOT NULL,
    auto_renew INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_admins_owner_id ON admins(owner_id);
  CREATE INDEX IF NOT EXISTS idx_staff_owner_id ON staff(owner_id);
  CREATE INDEX IF NOT EXISTS idx_customers_owner_id ON customers(owner_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_owner_id ON transactions(owner_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
  CREATE INDEX IF NOT EXISTS idx_licenses_owner_id ON licenses(owner_id);
`);

console.log("✅ Database initialized successfully");

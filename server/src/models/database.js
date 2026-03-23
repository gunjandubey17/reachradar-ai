import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data.db');
let wrappedDb;

export function getDB() {
  if (!wrappedDb) throw new Error('Database not initialized. Call initDB() first.');
  return wrappedDb;
}

function createWrapper(sqlDb) {
  function saveDB() {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }

  // Auto-save every 5 seconds
  setInterval(saveDB, 5000);

  return {
    exec: (sql) => {
      sqlDb.run(sql);
      saveDB();
    },
    prepare: (sql) => ({
      run: (...params) => {
        sqlDb.run(sql, params);
        saveDB();
      },
      get: (...params) => {
        const stmt = sqlDb.prepare(sql);
        if (params.length) stmt.bind(params);
        let result = null;
        if (stmt.step()) {
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          result = {};
          columns.forEach((col, i) => { result[col] = values[i]; });
        }
        stmt.free();
        return result;
      },
      all: (...params) => {
        const stmt = sqlDb.prepare(sql);
        if (params.length) stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          const row = {};
          columns.forEach((col, i) => { row[col] = values[i]; });
          results.push(row);
        }
        stmt.free();
        return results;
      },
    }),
  };
}

export async function initDB() {
  const SQL = await initSqlJs();

  let sqlDb;
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  wrappedDb = createWrapper(sqlDb);

  wrappedDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      plan TEXT DEFAULT 'free',
      stripe_customer_id TEXT,
      audits_remaining INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  wrappedDb.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      file_name TEXT,
      raw_data TEXT,
      risk_score INTEGER,
      risk_level TEXT,
      predicted_reach_drop TEXT,
      top_red_flags TEXT,
      potential_loss TEXT,
      fix_plan TEXT,
      full_report TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  wrappedDb.exec(`
    CREATE TABLE IF NOT EXISTS pre_post_checks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      content_text TEXT,
      safety_score INTEGER,
      virality_score INTEGER,
      suggestions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Database initialized');
}

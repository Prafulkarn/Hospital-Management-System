const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Function to clean SQL comments
function cleanSQL(sql) {
  return sql
    .split('\n')
    .map(line => {
      // Remove single-line comments
      const commentIndex = line.indexOf('--');
      return commentIndex > -1 ? line.substring(0, commentIndex) : line;
    })
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
}

async function runSetup() {
  let connection;
  try {
    // Connect to MySQL (without database first)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('✅ Connected to MySQL Server');

    // Create database if not exists
    await connection.query('CREATE DATABASE IF NOT EXISTS hospital_db');
    console.log('✅ Database created/exists');

    // Select database
    await connection.query('USE hospital_db');
    console.log('✅ Using hospital_db');

    // Drop existing tables to start fresh
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['audit_log', 'billing', 'medical_records', 'appointments', 'beds', 'patients', 'doctors', 'departments'];
    for (const table of tables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
      } catch (e) {
        // Table might not exist, continue
      }
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Dropped existing tables');

    // Run schema.sql
    let schemaSQL = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    schemaSQL = cleanSQL(schemaSQL);
    const schemaParts = schemaSQL.split(';').filter(s => s.trim());
    for (const part of schemaParts) {
      if (part.trim() && !part.toLowerCase().includes('create database')) {
        try {
          await connection.query(part);
        } catch (e) {
          if (!e.message.includes('already exists')) {
            console.error('Schema error:', e.message);
          }
        }
      }
    }
    console.log('✅ Schema created');

    // Run procedures.sql
    let procSQL = fs.readFileSync(path.join(__dirname, '../db/procedures.sql'), 'utf8');
    procSQL = cleanSQL(procSQL);
    const procStatements = procSQL.split('$$').filter(s => s.trim());
    for (const stmt of procStatements) {
      if (stmt.trim()) {
        try {
          await connection.query(stmt + '$$');
        } catch (e) {
          if (!e.message.includes('already exists')) {
            console.error('Procedure error:', e.message);
          }
        }
      }
    }
    console.log('✅ Procedures created');

    // Run seed.sql
    let seedSQL = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf8');
    seedSQL = cleanSQL(seedSQL);
    const seedParts = seedSQL.split(';').filter(s => s.trim());
    for (const part of seedParts) {
      if (part.trim()) {
        try {
          await connection.query(part);
        } catch (e) {
          console.error('Seed error:', e.message);
        }
      }
    }
    console.log('✅ Seed data inserted');

    // Run triggers.sql if exists
    const triggersPath = path.join(__dirname, '../db/triggers.sql');
    if (fs.existsSync(triggersPath)) {
      let triggersSQL = fs.readFileSync(triggersPath, 'utf8');
      triggersSQL = cleanSQL(triggersSQL);
      const triggerStatements = triggersSQL.split('$$').filter(s => s.trim());
      for (const stmt of triggerStatements) {
        if (stmt.trim()) {
          try {
            await connection.query(stmt + '$$');
          } catch (e) {
            if (!e.message.includes('already exists')) {
              console.error('Trigger error:', e.message);
            }
          }
        }
      }
      console.log('✅ Triggers created');
    }

    // Run views.sql if exists
    const viewsPath = path.join(__dirname, '../db/views.sql');
    if (fs.existsSync(viewsPath)) {
      let viewsSQL = fs.readFileSync(viewsPath, 'utf8');
      viewsSQL = cleanSQL(viewsSQL);
      const viewsParts = viewsSQL.split(';').filter(s => s.trim());
      for (const part of viewsParts) {
        if (part.trim()) {
          try {
            await connection.query(part);
          } catch (e) {
            if (!e.message.includes('already exists')) {
              console.error('View error:', e.message);
            }
          }
        }
      }
      console.log('✅ Views created');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('Now run: npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runSetup();

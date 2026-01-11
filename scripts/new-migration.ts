#!/usr/bin/env tsx
/**
 * Create a new SQL migration file with timestamp-based name to avoid duplicates.
 * Usage: npm run db:new -- <slug>
 */
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const slug = (args[0] || 'migration').replace(/[^a-z0-9-_]/gi, '-').toLowerCase()

function nowStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}${mm}${dd}_${hh}${mi}`
}

const baseName = `${nowStamp()}_${slug}.sql`
const migrationsDir = path.resolve('supabase', 'migrations')

fs.mkdirSync(migrationsDir, { recursive: true })

let fileName = baseName
let i = 1
while (fs.existsSync(path.join(migrationsDir, fileName))) {
  fileName = `${baseName.replace(/\.sql$/, '')}_${i}.sql`
  i += 1
}

const fullPath = path.join(migrationsDir, fileName)
const template = `-- Migration: ${slug}\n-- Created at: ${new Date().toISOString()}\n\n-- Write your SQL changes here.\n`
fs.writeFileSync(fullPath, template, 'utf8')

console.log(`Created migration: ${path.relative(process.cwd(), fullPath)}`)

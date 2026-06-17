import sqlite3
import os

DB_PATH = 'waste_system.db'
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute("SELECT DISTINCT user_email FROM scans")
emails = c.fetchall()
print("Distinct emails in scans table:", emails)

c.execute("SELECT COUNT(*) FROM scans")
total_scans = c.fetchone()[0]
print("Total scans in table:", total_scans)

c.execute("SELECT * FROM scans ORDER BY id DESC LIMIT 5")
recent = c.fetchall()
print("Recent scans:")
for r in recent:
    print(r)

conn.close()

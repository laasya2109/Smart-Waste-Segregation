import sqlite3
import os

DB_PATH = 'waste_system.db'
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute("SELECT * FROM users")
users = c.fetchall()
print("Users in database:")
for u in users:
    print(u)

conn.close()

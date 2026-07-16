import sqlite3
conn = sqlite3.connect("SalesDB/sales.db")

cursor = conn.cursor()
cursor.execute("""SELECT * FROM orders""")
# rows = cursor.fetchall()


results = cursor.fetchall()

print("Orders found:")
for r in results:
    print(r)

conn.close()   

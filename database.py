import sqlite3
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'waste_system.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 1. Create Users Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # 2. Create Scans Table
    c.execute("DROP TABLE IF EXISTS scans")
    c.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            item_name TEXT NOT NULL,
            category TEXT NOT NULL,
            bin_name TEXT NOT NULL,
            recyclable TEXT NOT NULL,
            confidence INTEGER DEFAULT 90,
            scan_date TEXT NOT NULL
        )
    ''')
    
    # 3. Create Recycling Centers Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS recycling_centers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            pincode TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            waste_type TEXT NOT NULL,
            address TEXT NOT NULL,
            phone TEXT DEFAULT '+91 99999 99999',
            hours TEXT DEFAULT '9:00 AM - 6:00 PM'
        )
    ''')
    
    # Pre-populate demo user
    c.execute("SELECT * FROM users WHERE email='test@example.com'")
    if not c.fetchone():
        c.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            ("EcoStation Admin", "test@example.com", "test1234")
        )
        
    # Clear all scans to ensure a clean slate
    c.execute("DELETE FROM scans")
    
    # Seed recycling centers
    c.execute("DELETE FROM recycling_centers")
    centers = [
        # Hyderabad Gachibowli 500032
        ("Gachibowli E-Waste Hub", "500032", 17.4483, 78.3741, "E-Waste", "Botanical Garden Road, Gachibowli, Hyderabad", "+91 90100 12345", "9:00 AM - 6:00 PM"),
        ("Gachibowli Plastic & Metal Center", "500032", 17.4520, 78.3800, "Plastic", "Hitech City Road, Gachibowli, Hyderabad", "+91 90100 12346", "9:30 AM - 6:30 PM"),
        ("Gachibowli Compost Facility", "500032", 17.4410, 78.3700, "Organic", "Financial District, Gachibowli, Hyderabad", "+91 90100 12347", "8:00 AM - 5:00 PM"),
        ("Bio-Waste Organic Recycling", "500032", 17.4380, 78.3650, "Organic", "Journalist Colony, Gachibowli, Hyderabad", "+91 90100 12348", "24/7 Drop Box"),
        ("Gachibowli Paper Recycling Depot", "500032", 17.4550, 78.3720, "Paper", "Telecom Nagar, Gachibowli, Hyderabad", "+91 90100 12349", "9:00 AM - 5:30 PM"),
        
        # Hyderabad Madhapur 500081
        ("Madhapur Paper Recycling Corp", "500081", 17.4416, 78.3826, "Paper", "Near Metro Station, Madhapur, Hyderabad", "+91 91100 23456", "9:00 AM - 6:00 PM"),
        ("Madhapur E-Waste Station", "500081", 17.4450, 78.3900, "E-Waste", "Image Gardens Road, Madhapur, Hyderabad", "+91 91100 23457", "10:00 AM - 7:00 PM"),
        ("Green Plastic Center", "500081", 17.4390, 78.3790, "Plastic", "Ayyappa Society, Madhapur, Hyderabad", "+91 91100 23458", "9:00 AM - 6:00 PM"),
        ("Madhapur Glass Recycling Depot", "500081", 17.4480, 78.3850, "Glass", "Kavuri Hills, Madhapur, Hyderabad", "+91 91100 23459", "9:30 AM - 5:30 PM"),
        ("Madhapur Metal Scrap Yard", "500081", 17.4350, 78.3880, "Metal", "Madhapur Police Station Rd, Hyderabad", "+91 91100 23460", "8:00 AM - 8:00 PM"),

        # Hyderabad Kondapur 500019
        ("Kondapur Glass Recycling Hub", "500019", 17.4622, 78.3568, "Glass", "Main Road, Kondapur, Hyderabad", "+91 92100 34567", "9:00 AM - 6:00 PM"),
        ("Kondapur Metal Salvage", "500019", 17.4650, 78.3620, "Metal", "Hafeezpet Road, Kondapur, Hyderabad", "+91 92100 34568", "9:00 AM - 7:00 PM"),
        ("Kondapur Organic Composter", "500019", 17.4580, 78.3520, "Organic", "Raghavendra Colony, Kondapur, Hyderabad", "+91 92100 34569", "7:00 AM - 4:00 PM"),
        ("Kondapur E-waste Drop Box", "500019", 17.4600, 78.3550, "E-Waste", "RTA Office Road, Kondapur, Hyderabad", "+91 92100 34570", "24/7 Drop Box"),

        # Delhi CP 110001
        ("CP E-Waste Hub", "110001", 28.6304, 77.2177, "E-Waste", "Connaught Place, New Delhi", "+91 98100 11111", "9:00 AM - 6:00 PM"),
        ("CP Plastic Recycling Center", "110001", 28.6350, 77.2220, "Plastic", "Connaught Place Outer Circle, New Delhi", "+91 98100 22222", "10:00 AM - 7:30 PM"),
        ("CP Paper Recycling Corp", "110001", 28.6280, 77.2150, "Paper", "Barakhamba Road, Connaught Place, New Delhi", "+91 98100 33333", "9:00 AM - 5:00 PM"),

        # Mumbai Fort 400001
        ("Mumbai GreenLeaf Recycling", "400001", 18.9400, 72.8353, "E-Waste", "Fort District, Mumbai", "+91 99100 44444", "9:00 AM - 6:00 PM"),
        ("Mumbai Plastic Depot", "400001", 18.9450, 72.8400, "Plastic", "Colaba Main Road, Mumbai", "+91 99100 55555", "10:00 AM - 7:00 PM"),
        ("Mumbai Compost & Bio Hub", "400001", 18.9350, 72.8300, "Organic", "Marine Drive Extension, Mumbai", "+91 99100 66666", "8:00 AM - 5:00 PM"),

        # Bangalore MG Road 560001
        ("Bangalore Compost Hub", "560001", 12.9716, 77.5946, "Organic", "MG Road, Bangalore", "+91 97100 77777", "9:00 AM - 5:00 PM"),
        ("Bangalore E-Waste & Metal Recyclers", "560001", 12.9750, 77.6000, "E-Waste", "Brigade Road, Bangalore", "+91 97100 88888", "10:00 AM - 7:00 PM"),
        ("Bangalore Paper & Plastic Salvage", "560001", 12.9680, 77.5900, "Plastic", "Residency Road, Bangalore", "+91 97100 99999", "9:00 AM - 6:00 PM")
    ]
    c.executemany("INSERT INTO recycling_centers (name, pincode, latitude, longitude, waste_type, address, phone, hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", centers)
    
    conn.commit()
    conn.close()
    print(f"Database initialized successfully with clean slate at: {DB_PATH}")

if __name__ == '__main__':
    init_db()

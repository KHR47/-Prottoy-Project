const API_URL = 'http://localhost:3001';

async function seed() {
  let token;
  try {
    // Try to register an admin user
    await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin', email: 'admin_seed@gmail.com', password: 'password123', role: 'admin' })
    });
    
    // Login to get token
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin_seed@gmail.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    token = loginData.accessToken;
    console.log("Logged in successfully. Token acquired.");
  } catch(e) {
    console.error("Error setting up admin user:", e);
    return;
  }

  const lots = [
    { name: "Gulshan Plaza Parking", location: "Gulshan-1, Dhaka", hourlyRate: 50, floors: 2 },
    { name: "Banani Supermarket Lot", location: "Banani, Dhaka", hourlyRate: 40, floors: 1 },
    { name: "Dhanmondi Lake View", location: "Dhanmondi 8, Dhaka", hourlyRate: 30, floors: 3 },
    { name: "Motijheel Commercial Lot", location: "Motijheel, Dhaka", hourlyRate: 60, floors: 4 },
    { name: "Uttara Sector 7 Parking", location: "Uttara, Dhaka", hourlyRate: 30, floors: 2 },
    { name: "Bashundhara City Basement", location: "Panthapath, Dhaka", hourlyRate: 50, floors: 3 },
    { name: "Mirpur 10 Metro Hub", location: "Mirpur 10, Dhaka", hourlyRate: 20, floors: 1 },
    { name: "Karwan Bazar Wholesale Lot", location: "Karwan Bazar, Dhaka", hourlyRate: 40, floors: 1 },
    { name: "Mohakhali DOHS Lot", location: "Mohakhali, Dhaka", hourlyRate: 50, floors: 2 },
    { name: "Baily Road Complex", location: "Baily Road, Dhaka", hourlyRate: 60, floors: 1 }
  ];

  for (let lot of lots) {
    console.log(`Creating lot: ${lot.name}...`);
    const res = await fetch(`${API_URL}/parking/lots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(lot)
    });
    
    if (!res.ok) {
        console.error("Failed to create lot:", await res.text());
        continue;
    }
    
    const createdLot = await res.json();
    console.log("Created lot:", createdLot.name);
    
    // Create some slots
    const slotsCount = Math.floor(Math.random() * 20) + 10;
    console.log(`Adding ${slotsCount} slots...`);
    await fetch(`${API_URL}/parking/lots/${createdLot.id}/slots/bulk`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ count: slotsCount, floor: "1", zone: "A", type: "car" })
    });
  }
  console.log("Seeding complete!");
}

seed();

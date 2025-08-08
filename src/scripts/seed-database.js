// To run this script, you need Node.js installed.
// 1. Make sure you have your Firebase credentials in a .env.local file in the project root.
//    (Copy the contents of .env and fill in your NEXT_PUBLIC_FIREBASE_* variables).
// 2. Install dependencies: `npm install firebase-admin node-fetch`
// 3. Run the script from your project's root directory: `node src/scripts/seed-database.js`

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// IMPORTANT: Download your service account key from Firebase Console
// Project settings > Service accounts > Generate new private key
// Save it as 'serviceAccountKey.json' in the project root, and DO NOT commit it to git.
const serviceAccount = require('../../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// --- Data to be seeded ---

const rolesData = {
  "super-admin": {
    "id": "super-admin", "name": "Super Admin", "isEditable": false,
    "permissions": ["view-dashboard", "manage-projects", "view-equipment", "manage-equipment", "view-inspector", "manage-inspectors", "manage-reports", "manage-users", "view-settings", "view-profile", "manage-employees", "manage-trips", "view-approvals", "super-admin", "view-tenders", "manage-tenders"]
  },
  "project-manager": {
    "id": "project-manager", "name": "Project Manager", "isEditable": true,
    "permissions": ["view-dashboard", "manage-projects", "view-equipment", "manage-equipment", "view-inspector", "manage-inspectors", "manage-reports", "view-settings", "view-profile", "manage-employees", "manage-trips", "view-approvals", "view-tenders", "manage-tenders"]
  },
  "project-admin": {
    "id": "project-admin", "name": "Project Admin", "isEditable": true,
    "permissions": ["view-dashboard", "manage-projects", "view-equipment", "manage-equipment", "view-inspector", "manage-inspectors", "manage-reports", "view-settings", "view-profile"]
  },
  "inspector": {
    "id": "inspector", "name": "Inspector", "isEditable": true,
    "permissions": ["view-dashboard", "manage-reports", "view-equipment", "view-inspector", "view-profile"]
  },
  "staff": {
    "id": "staff", "name": "Staff Cabang", "isEditable": true,
    "permissions": ["view-dashboard", "view-profile", "view-equipment", "view-inspector", "manage-trips"]
  },
  "employee": {
    "id": "employee", "name": "Employee", "isEditable": true,
    "permissions": ["view-dashboard", "view-profile", "manage-employees", "manage-trips"]
  },
  "client-qaqc": {
    "id": "client-qaqc", "name": "Client QAQC", "isEditable": true,
    "permissions": ["view-dashboard", "manage-reports", "view-profile", "view-approvals"]
  },
  "client-rep": {
    "id": "client-rep", "name": "Client Representative", "isEditable": true,
    "permissions": ["view-dashboard", "manage-reports", "view-profile", "view-approvals"]
  },
  "tender-admin": {
    "id": "tender-admin", "name": "Tender Admin", "isEditable": true,
    "permissions": ["view-dashboard", "view-tenders", "manage-tenders", "view-profile"]
  }
};

const branchesData = {
  "kantor-pusat": { "id": "kantor-pusat", "name": "Kantor Pusat", "region": "Kantor Pusat" },
  "bandar-lampung": { "id": "bandar-lampung", "name": "Cabang Bandar Lampung", "region": "Regional Barat" },
  "bandung": { "id": "bandung", "name": "Cabang Bandung", "region": "Regional Barat" },
  "batam": { "id": "batam", "name": "Cabang Batam", "region": "Regional Barat" },
  "bekasi": { "id": "bekasi", "name": "Cabang Bekasi", "region": "Regional Barat" },
  "bengkulu": { "id": "bengkulu", "name": "Cabang Bengkulu", "region": "Regional Barat" },
  "cilacap": { "id": "cilacap", "name": "Cabang Cilacap", "region": "Regional Barat" },
  "cilegon": { "id": "cilegon", "name": "Cabang Cilegon", "region": "Regional Barat" },
  "cirebon": { "id": "cirebon", "name": "Cabang Cirebon", "region": "Regional Barat" },
  "dumai": { "id": "dumai", "name": "Cabang Dumai", "region": "Regional Barat" },
  "jakarta": { "id": "jakarta", "name": "Cabang Jakarta", "region": "Regional Barat" },
  "jambi": { "id": "jambi", "name": "Cabang Jambi", "region": "Regional Barat" },
  "medan": { "id": "medan", "name": "Cabang Medan", "region": "Regional Barat" },
  "padang": { "id": "padang", "name": "Cabang Padang", "region": "Regional Barat" },
  "pekanbaru": { "id": "pekanbaru", "name": "Cabang Pekanbaru", "region": "Regional Barat" },
  "palembang": { "id": "palembang", "name": "Cabang Palembang", "region": "Regional Barat" },
  "semarang": { "id": "semarang", "name": "Cabang Semarang", "region": "Regional Barat" },
  "balikpapan": { "id": "balikpapan", "name": "Cabang Balikpapan", "region": "Regional Timur" },
  "banjarmasin": { "id": "banjarmasin", "name": "Cabang Banjarmasin", "region": "Regional Timur" },
  "batu-licin": { "id": "batu-licin", "name": "Cabang Batu Licin", "region": "Regional Timur" },
  "bontang": { "id": "bontang", "name": "Cabang Bontang", "region": "Regional Timur" },
  "denpasar": { "id": "denpasar", "name": "Cabang Denpasar", "region": "Regional Timur" },
  "makassar": { "id": "makassar", "name": "Cabang Makassar", "region": "Regional Timur" },
  "kendari": { "id": "kendari", "name": "Cabang Kendari", "region": "Regional Timur" },
  "pontianak": { "id": "pontianak", "name": "Cabang Pontianak", "region": "Regional Timur" },
  "samarinda": { "id": "samarinda", "name": "Cabang Samarinda", "region": "Regional Timur" },
  "sangatta": { "id": "sangatta", "name": "Cabang Sangatta", "region": "Regional Timur" },
  "surabaya": { "id": "surabaya", "name": "Cabang Surabaya", "region": "Regional Timur" },
  "tarakan": { "id": "tarakan", "name": "Cabang Tarakan", "region": "Regional Timur" },
  "timika": { "id": "timika", "name": "Cabang Timika", "region": "Regional Timur" }
};

const usersData = {
  "1": { "id": 1, "name": "Super Admin", "email": "superuser@example.com", "password": "password123", "roleId": "super-admin", "branchId": "kantor-pusat", "avatarUrl": "" },
  "2": { "id": 2, "name": "Project Manager", "email": "manager@example.com", "password": "password123", "roleId": "project-manager", "branchId": "jakarta", "avatarUrl": "" },
  "3": { "id": 3, "name": "Project Admin", "email": "admin@example.com", "password": "password123", "roleId": "project-admin", "branchId": "surabaya", "avatarUrl": "", "assignedProjectIds": [1] },
  "4": { "id": 4, "name": "Inspector User", "email": "inspector@example.com", "password": "password123", "roleId": "inspector", "branchId": "pekanbaru", "avatarUrl": "" },
  "5": { "id": 5, "name": "Staff User", "email": "staff@example.com", "password": "password123", "roleId": "staff", "branchId": "balikpapan", "avatarUrl": "" },
  "6": { "id": 6, "name": "Employee User", "email": "employee@example.com", "password": "password123", "roleId": "employee", "branchId": "bandung", "avatarUrl": "" },
  "7": { "id": 7, "name": "Tender Admin", "email": "tender@example.com", "password": "password123", "roleId": "tender-admin", "branchId": "kantor-pusat", "avatarUrl": "" },
  "8": { "id": 8, "name": "QAQC Client", "email": "qaqc@client.com", "password": "password123", "roleId": "client-qaqc", "branchId": "kantor-pusat", "avatarUrl": "" },
  "9": { "id": 9, "name": "Rep Client", "email": "rep@client.com", "password": "password123", "roleId": "client-rep", "branchId": "kantor-pusat", "avatarUrl": "" }
};


async function seedCollection(collectionName, data) {
  const collectionRef = db.collection(collectionName);
  const promises = [];
  console.log(`Seeding ${collectionName}...`);

  for (const [docId, docData] of Object.entries(data)) {
    promises.push(collectionRef.doc(docId).set(docData));
  }

  await Promise.all(promises);
  console.log(`Successfully seeded ${promises.length} documents in ${collectionName}.`);
}

async function main() {
  try {
    await seedCollection('roles', rolesData);
    await seedCollection('branches', branchesData);
    await seedCollection('users', usersData);
    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

main();

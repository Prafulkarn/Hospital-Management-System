const db = require('./db');
require('dotenv').config();

async function testDB() {
  try {
    const [patients] = await db.query('SELECT COUNT(*) as count FROM patients');
    const [doctors] = await db.query('SELECT COUNT(*) as count FROM doctors');
    const [appointments] = await db.query('SELECT COUNT(*) as count FROM appointments');
    const [beds] = await db.query('SELECT COUNT(*) as count FROM beds');
    const [depts] = await db.query('SELECT COUNT(*) as count FROM departments');

    console.log('\n📊 Database Status:');
    console.log('   Patients:', patients[0].count);
    console.log('   Doctors:', doctors[0].count);
    console.log('   Appointments:', appointments[0].count);
    console.log('   Beds:', beds[0].count);
    console.log('   Departments:', depts[0].count);
    
    if (patients[0].count > 0) {
      console.log('\n✅ Data exists in database!');
    } else {
      console.log('\n❌ No data found in database');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

testDB();

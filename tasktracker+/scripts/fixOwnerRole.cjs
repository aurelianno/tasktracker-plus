const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktracker';
const path = require('path');
const mongoose = require(path.join(__dirname, '../server/node_modules/mongoose'));
const Team = require(path.join(__dirname, '../server/models/Team'));

async function migrateOwners() {
  await mongoose.connect(MONGODB_URI);
  const teams = await Team.find({});
  let updated = 0;

  for (const team of teams) {
    const creatorMember = team.members.find(m => m.userId.toString() === team.createdBy.toString());
    if (creatorMember && creatorMember.role === 'admin') {
      creatorMember.role = 'owner';
      await team.save();
      updated++;
      console.log(`Updated team ${team._id}: set creator ${team.createdBy} as owner.`);
    }
  }

  console.log(`\nMigration complete. Updated ${updated} team(s).`);
  await mongoose.disconnect();
}

migrateOwners().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 
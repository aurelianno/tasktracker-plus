// fixPersonalTasksTeamField.cjs
// Run with: node scripts/fixPersonalTasksTeamField.cjs

const mongoose = require('../server/node_modules/mongoose');
const Task = require('../server/models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasktracker';

async function fixTeamFields() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Find tasks where team is the string 'null'
  const stringNull = await Task.updateMany({ team: 'null' }, { $set: { team: null } });
  console.log(`Updated ${stringNull.nModified || stringNull.modifiedCount} tasks with team: 'null' to team: null`);

  // Find tasks where team is undefined (field exists but is undefined)
  const undefinedTeam = await Task.updateMany({ team: undefined }, { $unset: { team: '' } });
  console.log(`Unset team field for ${undefinedTeam.nModified || undefinedTeam.modifiedCount} tasks where team was undefined`);

  // Find tasks where team is an empty string
  const emptyString = await Task.updateMany({ team: '' }, { $set: { team: null } });
  console.log(`Updated ${emptyString.nModified || emptyString.modifiedCount} tasks with team: '' to team: null`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

fixTeamFields().catch(err => {
  console.error('Error fixing team fields:', err);
  process.exit(1);
}); 
// fixPersonalTasksTeamField.cjs
// Run with: node scripts/fixPersonalTasksTeamField.cjs

const mongoose = require('mongoose');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktracker';

async function fixTeamFields() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Find all tasks where team is a string (invalid for ObjectId field)
  const tasksWithStringTeam = await Task.aggregate([
    {
      $addFields: {
        teamType: { $type: "$team" }
      }
    },
    {
      $match: {
        teamType: 'string'
      }
    }
  ]);

  console.log(`Found ${tasksWithStringTeam.length} tasks where team is a string (invalid)`);

  if (tasksWithStringTeam.length > 0) {
    const ids = tasksWithStringTeam.map(t => t._id);
    const result = await Task.updateMany({ _id: { $in: ids } }, { $set: { team: null } });
    console.log(`Updated ${result.modifiedCount} tasks with string team to team: null`);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

fixTeamFields().catch(err => {
  console.error('Error fixing team fields:', err);
  process.exit(1);
}); 
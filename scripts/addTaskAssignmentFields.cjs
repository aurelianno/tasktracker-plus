const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktracker';

const taskSchema = new mongoose.Schema({
  assignmentHistory: {
    type: Array,
    default: []
  },
  visibility: {
    type: String,
    enum: ['personal', 'team', 'assigned'],
    default: 'personal'
  },
  assignmentDate: {
    type: Date,
    default: null
  }
}, { strict: false }); // strict: false allows updating existing docs with new fields

const Task = mongoose.model('Task', taskSchema, 'tasks');

async function addFieldsAndIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all tasks: add missing fields if not present
    const updateResult = await Task.updateMany(
      {},
      {
        $set: {
          'visibility': 'personal',
          'assignmentDate': null
        },
        $setOnInsert: {
          'assignmentHistory': []
        }
      },
      { upsert: false, multi: true }
    );
    // For assignmentHistory, ensure it's an array if missing
    await Task.updateMany(
      { assignmentHistory: { $exists: false } },
      { $set: { assignmentHistory: [] } }
    );
    console.log('Updated tasks:', updateResult.nModified || updateResult.modifiedCount);

    // Create indexes for assignment queries
    await Task.collection.createIndex({ team: 1, assignedTo: 1, status: 1 });
    await Task.collection.createIndex({ team: 1, visibility: 1 });
    console.log('Indexes created (if not already present)');

    await mongoose.disconnect();
    console.log('Done. Disconnected from MongoDB.');
  } catch (err) {
    console.error('Error updating tasks:', err);
    process.exit(1);
  }
}

addFieldsAndIndexes(); 
const path = require('path');
const mongoose = require(path.join(__dirname, '../server/node_modules/mongoose'));

// Hard-code MongoDB URI or get from environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktracker';

const Task = require(path.join(__dirname, '../server/models/Task'));

const fixCompletedAtFields = async () => {
  try {
    console.log('🚀 Starting migration...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const tasksToFix = await Task.find({
      status: 'completed',
      $or: [
        { completedAt: { $exists: false } },
        { completedAt: null }
      ]
    });

    console.log(`📊 Found ${tasksToFix.length} completed tasks to fix`);

    if (tasksToFix.length === 0) {
      console.log('✅ No tasks to fix!');
      return;
    }

    let fixedCount = 0;
    for (const task of tasksToFix) {
      const completedAt = task.updatedAt || task.createdAt || new Date();
      await Task.findByIdAndUpdate(task._id, { completedAt: completedAt });
      fixedCount++;
      console.log(`Fixed: ${task.title}`);
    }

    console.log(`✅ Fixed ${fixedCount} tasks`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Done!');
  }
};

fixCompletedAtFields();
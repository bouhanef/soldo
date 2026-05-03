import mongoose from 'mongoose';
import Category from './models/category';
import Source from './models/source';

const MONGODB_URI = process.env.MONGODB_URI!;

const defaultCategories = [
  { name: 'Food & Groceries', color: '#22c55e' },
  { name: 'Transport', color: '#3b82f6' },
  { name: 'Housing', color: '#f59e0b' },
  { name: 'Health', color: '#ef4444' },
  { name: 'Entertainment', color: '#a855f7' },
  { name: 'Clothing', color: '#ec4899' },
  { name: 'Travel', color: '#06b6d4' },
  { name: 'Education', color: '#f97316' },
  { name: 'Subscriptions', color: '#6366f1' },
  { name: 'Other', color: '#71717a' },
];

const defaultSources = [
  { name: 'Cash' },
  { name: 'Credit Card' },
  { name: 'Debit Card' },
  { name: 'Bank Transfer' },
  { name: 'PayPal' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    await Category.insertMany(defaultCategories);
    console.log(`Inserted ${defaultCategories.length} categories`);
  } else {
    console.log(`Skipped categories (${categoryCount} already exist)`);
  }

  const sourceCount = await Source.countDocuments();
  if (sourceCount === 0) {
    await Source.insertMany(defaultSources);
    console.log(`Inserted ${defaultSources.length} sources`);
  } else {
    console.log(`Skipped sources (${sourceCount} already exist)`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

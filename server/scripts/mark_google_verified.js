require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const res = await User.updateMany({ $or: [{ authProvider: 'google' }, { googleId: { $exists: true } }] }, { $set: { isEmailVerified: true } });
  console.log('Matched:', res.matchedCount || res.n || res.nModified ? (res.matchedCount || res.n) : 0, 'Modified:', res.modifiedCount || res.nModified || 0);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(2); });

/*
  Script: backfillCVOwners.js
  Mục đích: cập nhật trường `owner` cho các CV chưa có owner.
  Cách hoạt động:
    - Nếu CV có `personalInfo.email`, script sẽ tìm user có email đó và gán owner = user._id
    - Nếu không tìm thấy và biến môi trường BACKFILL_DEFAULT_OWNER_EMAIL được đặt, sẽ gán owner = user tương ứng với email mặc định
    - Nếu không tìm thấy owner nào, CV sẽ được bỏ qua và in log

  Lưu ý: Sao lưu DB trước khi chạy (mongodump hoặc backup GUI). Chạy trong folder `server` bằng PowerShell:

    cd "c:\Users\ADMIN\Desktop\AI create CV\server"
    node .\scripts\backfillCVOwners.js

  Bạn có thể đặt BACKFILL_DEFAULT_OWNER_EMAIL trong file .env nếu muốn gán CV không khớp cho 1 user mặc định.
*/

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-cv';
const DEFAULT_OWNER_EMAIL = process.env.BACKFILL_DEFAULT_OWNER_EMAIL; // optional

async function main() {
  console.log('Connecting to', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected.');

  const db = mongoose.connection;
  const cvColl = db.collection('cvs');
  const userColl = db.collection('users');

  // Find CVs missing owner or owner == null
  const cursor = cvColl.find({ $or: [{ owner: { $exists: false } }, { owner: null }] });
  const total = await cursor.count();
  console.log(`Found ${total} CV(s) without owner.`);

  let updated = 0;
  let skipped = 0;

  // Pre-fetch default owner if provided
  let defaultOwner = null;
  if (DEFAULT_OWNER_EMAIL) {
    defaultOwner = await userColl.findOne({ email: DEFAULT_OWNER_EMAIL.toLowerCase() });
    if (!defaultOwner) {
      console.warn('BACKFILL_DEFAULT_OWNER_EMAIL set but no matching user found for that email. Ignoring default owner.');
      defaultOwner = null;
    } else {
      console.log('Default owner found:', defaultOwner._id.toString());
    }
  }

  const cvs = await cursor.toArray();
  for (const cv of cvs) {
    try {
      let ownerId = null;
      const email = (cv.personalInfo && cv.personalInfo.email) ? String(cv.personalInfo.email).toLowerCase().trim() : null;
      if (email) {
        const user = await userColl.findOne({ email });
        if (user) ownerId = user._id;
      }

      if (!ownerId && defaultOwner) {
        ownerId = defaultOwner._id;
      }

      if (!ownerId) {
        console.log(`Skipping CV ${cv._id}: no email match and no default owner.`);
        skipped++;
        continue;
      }

      // Update CV document
      await cvColl.updateOne({ _id: cv._id }, { $set: { owner: ownerId } });

      // Ensure user.cvs array contains this cv._id
      await userColl.updateOne({ _id: ownerId }, { $addToSet: { cvs: cv._id } });

      console.log(`Updated CV ${cv._id} -> owner ${ownerId.toString()}`);
      updated++;
    } catch (err) {
      console.error('Error processing CV', cv._id, err.message || err);
    }
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});

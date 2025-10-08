/*
  seedDatabase.js
  Tạo database mẫu với users và CVs (mỗi CV có owner liên kết)

  Cách dùng:
    - Thêm MONGODB_URI vào file .env của thư mục server, ví dụ:
        MONGODB_URI=mongodb://localhost:27017/ai-cv
    - (Tuỳ chọn) nếu muốn xóa database hiện có trước khi seed, set DROP_DB=true

    cd "c:\Users\ADMIN\Desktop\AI create CV\server"
    # seed without dropping
    node .\scripts\seedDatabase.js
    # or drop existing DB then seed
    DROP_DB=true node .\scripts\seedDatabase.js

  Lưu ý: nên backup DB nếu chứa dữ liệu quan trọng. Script này chỉ dành cho môi trường phát triển.
*/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-cv';
const DROP_DB = process.env.DROP_DB === 'true' || process.env.DROP_DB === '1';

async function main() {
  console.log('Connecting to', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  console.log('Connected to MongoDB');

  if (DROP_DB) {
    console.log('Dropping database...');
    await db.dropDatabase();
    console.log('Database dropped.');
  }

  const userColl = db.collection('users');
  const cvColl = db.collection('cvs');

  // create users
  const passwordPlain = 'password123';
  const hashed = await bcrypt.hash(passwordPlain, 10);

  const users = [
    {
      email: 'alice@example.com',
      username: 'alice',
      password: hashed,
      firstName: 'Alice',
      lastName: 'Nguyen',
      role: 'user',
      authProvider: 'local',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'bob@example.com',
      username: 'bob',
      password: hashed,
      firstName: 'Bob',
      lastName: 'Tran',
      role: 'user',
      authProvider: 'local',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'admin@example.com',
      username: 'admin',
      password: hashed,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      authProvider: 'local',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const insertRes = await userColl.insertMany(users);
  console.log('Inserted users:', insertRes.insertedCount);

  const userIds = Object.values(insertRes.insertedIds);
  const aliceId = userIds[0];
  const bobId = userIds[1];
  const adminId = userIds[2];

  // create CVs linked to users
  const cvs = [
    {
      personalInfo: {
        fullName: 'Alice Nguyễn',
        jobTitle: 'Software Engineer',
        email: 'alice@example.com',
        phone: '+84 90 000 0000',
        address: 'Hanoi, Vietnam',
        summary: 'Experienced full-stack developer.'
      },
      experience: [],
      education: [],
      skills: [{ category: 'Technical', skills: [{ name: 'JavaScript' }, { name: 'Node.js' }] }],
      projects: [],
      owner: aliceId,
      metadata: { isPublic: false, views: 0, version: 1, status: 'draft' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      personalInfo: {
        fullName: 'Bob Trần',
        jobTitle: 'Data Analyst',
        email: 'bob@example.com',
        phone: '+84 91 111 1111',
        address: 'Ho Chi Minh City, Vietnam',
        summary: 'Data analyst specializing in business intelligence.'
      },
      experience: [],
      education: [],
      skills: [{ category: 'Technical', skills: [{ name: 'SQL' }, { name: 'Python' }] }],
      projects: [],
      owner: bobId,
      metadata: { isPublic: false, views: 0, version: 1, status: 'draft' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      personalInfo: {
        fullName: 'Company Sample CV',
        jobTitle: 'Admin CV',
        email: 'admin@example.com',
        phone: '+84 92 222 2222',
        address: 'Da Nang, Vietnam',
        summary: 'Admin-level sample CV visible to admin.'
      },
      experience: [],
      education: [],
      skills: [{ category: 'Management', skills: [{ name: 'Leadership' }] }],
      projects: [],
      owner: adminId,
      metadata: { isPublic: false, views: 0, version: 1, status: 'draft' },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const cvInsert = await cvColl.insertMany(cvs);
  console.log('Inserted CVs:', cvInsert.insertedCount);

  // update users.cvs arrays
  await userColl.updateOne({ _id: aliceId }, { $set: { cvs: [cvInsert.insertedIds[0]] } });
  await userColl.updateOne({ _id: bobId }, { $set: { cvs: [cvInsert.insertedIds[1]] } });
  await userColl.updateOne({ _id: adminId }, { $set: { cvs: [cvInsert.insertedIds[2]] } });

  console.log('Seed complete.');
  console.log('Sample credentials:');
  console.log('  alice@example.com / password123');
  console.log('  bob@example.com / password123');
  console.log('  admin@example.com / password123');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error seeding DB:', err);
  process.exit(1);
});

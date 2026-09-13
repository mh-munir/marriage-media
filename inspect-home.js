/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const mongoose = require('mongoose');

const text = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  text
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^"|"$/g, '')];
    })
);

(async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    const db = mongoose.connection.db;
    const now = new Date();

    const counts = {
      all: await db.collection('profiles').countDocuments({}),
      premium: await db.collection('profiles').countDocuments({ isPremium: true }),
      activePremium: await db.collection('profiles').countDocuments({ isPremium: true, premiumExpiry: { $gt: now } }),
      deactivated: await db.collection('profiles').countDocuments({ isDeactivated: true }),
      visible: await db.collection('profiles').countDocuments({ isVisible: true, isDeactivated: false }),
      visiblePremium: await db.collection('profiles').countDocuments({ isVisible: true, isDeactivated: false, isPremium: true, premiumExpiry: { $gt: now } }),
    };

    console.log('COUNTS');
    console.log(JSON.stringify(counts, null, 2));

    const docs = await db.collection('profiles')
      .find(
        { isPremium: true },
        { projection: { firstName: 1, lastName: 1, isPremium: 1, premiumExpiry: 1, isVisible: 1, isDeactivated: 1, isVerified: 1, createdAt: 1, photos: 1 } }
      )
      .limit(20)
      .toArray();

    console.log('DOCS');
    console.log(JSON.stringify(docs, null, 2));
  } catch (error) {
    console.error('ERROR');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();

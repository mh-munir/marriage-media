/* eslint-disable @typescript-eslint/no-require-imports */
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const users = db.collection('users');
  const profiles = db.collection('profiles');

  const publicUserIds = (await users.find({ role: 'user' }, { projection: { _id: 1 } }).toArray()).map((u) => u._id);
  const publicUserIdStrings = publicUserIds.map((id) => id.toString());

  const before = {
    users: await users.countDocuments({ role: 'user' }),
    profiles: await profiles.countDocuments({ userId: { $in: publicUserIds } }),
  };

  const relatedCollections = [
    'notifications',
    'favorites',
    'profileviews',
    'savedsearches',
    'messages',
    'conversations',
    'callhistory',
    'loginhistory',
    'payments',
    'reports',
    'fraudlogs',
    'auditlogs',
    'interests',
    'referrals',
    'notificationpreferences',
  ];

  const availableCollections = new Set((await db.listCollections().toArray()).map((c) => c.name.toLowerCase()));

  for (const collectionName of relatedCollections) {
    if (!availableCollections.has(collectionName)) continue;

    const collection = db.collection(collectionName);
    const filters = [
      { userId: { $in: publicUserIds } },
      { userId: { $in: publicUserIdStrings } },
      { senderId: { $in: publicUserIds } },
      { senderId: { $in: publicUserIdStrings } },
      { recipientId: { $in: publicUserIds } },
      { recipientId: { $in: publicUserIdStrings } },
      { ownerId: { $in: publicUserIds } },
      { ownerId: { $in: publicUserIdStrings } },
    ];

    let deletedCount = 0;
    for (const filter of filters) {
      try {
        const result = await collection.deleteMany(filter);
        deletedCount += result.deletedCount || 0;
      } catch {
        // Ignore unrelated collection field mismatches.
      }
    }

    if (deletedCount > 0) {
      console.log(JSON.stringify({ collection: collectionName, deleted: deletedCount }));
    }
  }

  const profileResult = await profiles.deleteMany({ userId: { $in: publicUserIds } });
  const userResult = await users.deleteMany({ role: 'user' });

  const after = {
    users: await users.countDocuments({ role: 'user' }),
    profiles: await profiles.countDocuments({ userId: { $in: publicUserIds } }),
  };

  console.log(JSON.stringify({
    before,
    deletedPublicUsers: userResult.deletedCount || 0,
    deletedProfileDocs: profileResult.deletedCount || 0,
    after,
  }));

  await client.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

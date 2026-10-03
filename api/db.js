import { MongoClient } from 'mongodb';

let client = null;
let connecting = null;
let indexed = false;

function uri() {
  return String(process.env.MONGODB_URI || '').trim();
}

export function mongoConfigured() {
  return !!uri();
}

export async function getDb() {
  const connection = uri();
  if (!connection) {
    const err = new Error('MONGODB_URI is not set');
    err.code = 'NO_MONGO';
    throw err;
  }
  if (client) return client.db();
  if (!connecting) {
    connecting = MongoClient.connect(connection).then((opened) => {
      client = opened;
      return opened;
    }).catch((err) => {
      connecting = null;
      throw err;
    });
  }
  const opened = await connecting;
  return opened.db();
}

export async function usersCollection() {
  const db = await getDb();
  const col = db.collection('users');
  if (!indexed) {
    await col.createIndex({ email: 1 }, { unique: true });
    indexed = true;
  }
  return col;
}

const mongoose = require('mongoose');

const OLD_URI = 'mongodb+srv://yashkulshrestha1102_db_user:Yash1102@cluster0.8quotei.mongodb.net/test';
const NEW_URI = 'mongodb+srv://yashkulshrestha1102_db_user:Yash1102@cluster0.8quotei.mongodb.net/legalvault';

async function migrate() {
  console.log('Starting migration: test -> legalvault\n');
  
  const srcConn = await mongoose.createConnection(OLD_URI).asPromise();
  console.log('Connected to TEST DB\n');
  
  const tgtConn = await mongoose.createConnection(NEW_URI).asPromise();
  console.log('Connected to LEGALVAULT DB\n');
  
  const collections = [
    'users', 'clients', 'registrations', 'contracts', 'policies',
    'gsts', 'hrs', 'incometaxes', 'financials',
    'corporatesecretariats', 'documents', 'pdfs',
    'notifications', 'auditlogs'
  ];
  
  let total = 0;
  
  for (const coll of collections) {
    try {
      const srcColl = srcConn.collection(coll);
      const tgtColl = tgtConn.collection(coll);
      
      const docs = await srcColl.find({}).toArray();
      
      if (docs.length === 0) {
        console.log('SKIP ' + coll + ': empty');
        continue;
      }
      
      let count = 0;
      for (const doc of docs) {
        try {
          await tgtColl.insertOne(doc);
          count++;
        } catch(e) {}
      }
      
      console.log('OK ' + coll + ': ' + count + '/' + docs.length);
      total += count;
    } catch(e) {
      console.log('ERR ' + coll + ': ' + e.message);
    }
  }
  
  console.log('\nMigration complete! Total: ' + total + ' documents');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

const admin = require('firebase-admin');

// ============================================================
// Initialize Firebase Admin
// ============================================================
// // 1. Cloud Functions에서 초기화 방법 1 (firebase deploy)
// admin.initializeApp();

// // 2. Cloud Functions에서 초기화 방법 2 (firebase deploy)
// admin.initializeApp(functions.config().firebase);

// 3. 자체 서버에서 초기화 (firebase serve)
const serviceAccount = require('../config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://viveloper-social.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
const firebase = require('firebase');

// ============================================================
// Initialize Firebase
// ============================================================
const firebaseConfig = require('../config/firebaseConfig');
firebase.initializeApp(firebaseConfig);

module.exports = firebase;
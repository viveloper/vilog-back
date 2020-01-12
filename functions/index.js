const functions = require('firebase-functions');
const express = require('express');
const app = express();
const cors = require('cors');
const authMiddleware = require('./util/authMiddleware');
const {signup, login, getAllSections, getPosts, uploadImage} = require('./handlers');

// cors
app.use(cors());

// routes
app.post('/signup', signup);
app.post('/login', login);
app.get('/sections', authMiddleware, getAllSections);
app.get('/:section/posts', authMiddleware, getPosts);
app.post('/user/image', authMiddleware, uploadImage);

// ============================================================
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// ============================================================
exports.api = functions.https.onRequest(app);
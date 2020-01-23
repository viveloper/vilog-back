const functions = require('firebase-functions');
const express = require('express');
const app = express();
const cors = require('cors');
const authMiddleware = require('./util/authMiddleware');
const {
  docs,
  signup,
  login,
  getAllSections,
  getPosts,
  getPost,
  addPost,
  uploadUserImage,
  uploadPostTitleImage
} = require('./handlers');

// cors
app.use(cors());

// template engine
app.set('views', './views');
app.set('view engine', 'ejs');

// routes
app.get('/', docs);
app.post('/signup', signup);
app.post('/login', login);
app.get('/sections', authMiddleware, getAllSections);
app.get('/:section/posts', authMiddleware, getPosts);
app.get('/posts/:id', authMiddleware, getPost);
app.post('/:section/posts', authMiddleware, addPost);
app.post('/user/image', authMiddleware, uploadUserImage);
app.post('/post/image', authMiddleware, uploadPostTitleImage);

// ============================================================
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// ============================================================
exports.api = functions.https.onRequest(app);

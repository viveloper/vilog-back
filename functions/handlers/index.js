const firebase = require('../util/firebase');
const { admin, db } = require('../util/firebaseAdmin');
const { validateSignupData, validateLoginData } = require('../util/validators');
const { storageBucket } = require('../config/firebaseConfig');

exports.docs = (req, res) => {
  const data = {
    title: 'Vilog Web API List',
    baseUrl: 'http://localhost:5000/viveloper-blog/us-central1/api'
  };
  res.render('index', data);
};

exports.getAllSections = (req, res) => {
  db.collection('sections')
    .orderBy('index', 'asc')
    .get()
    .then(data => {
      const sections = [];
      data.forEach(doc => {
        sections.push({
          sectionId: doc.id,
          index: doc.data().index,
          name: doc.data().name,
          description: doc.data().description
        });
      });
      return res.json({ sections });
    })
    .catch(err => console.error(err));
};

exports.getPosts = (req, res) => {
  db.collection('posts')
    .where('section', '==', req.params.section)
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      const posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          title: doc.data().title,
          content: doc.data().content,
          image: doc.data().image,
          author: doc.data().author,
          section: doc.data().section,
          createdAt: doc.data().createdAt
        });
      });
      return res.json({ posts });
    })
    .catch(err => console.error(err));
};

exports.addPost = (req, res) => {
  const newPost = {
    title: req.body.title,
    content: req.body.content,
    image: req.body.image
      ? req.body.image
      : 'https://source.unsplash.com/random',
    author: req.user.nickname,
    section: req.params.section,
    createdAt: new Date().toISOString()
  };

  db.collection('posts')
    .add(newPost)
    .then(doc => {
      res.status(201).json({
        postId: doc.id,
        message: `document ${doc.id} created successfully`
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.message });
    });
};

exports.getPost = (req, res) => {
  db.collection('posts')
    .doc(req.params.id)
    .get()
    .then(doc => {
      return res.json({ post: doc.data() });
    })
    .catch(err => console.error(err));
};

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    nickname: req.body.nickname,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  };

  // == validate data
  const validationResult = validateSignupData(newUser);
  if (!validationResult.valid)
    return res.status(400).json(validationResult.errors);
  // ==

  const noImg = 'no-img.png';

  db.collection('users')
    .doc(newUser.nickname)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ nickname: 'this nickname is already taken' });
      } else {
        let userId = null;
        let token = null;
        let userCredentials = null;
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
          })
          .then(idToken => {
            token = idToken;
            userCredentials = {
              nickname: newUser.nickname,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              imageUrl: `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${noImg}?alt=media`,
              userId,
              isAdmin: false
            };
            return db
              .collection('users')
              .doc(newUser.nickname)
              .set(userCredentials);
          })
          .then(() => {
            return res.status(201).json({ token, user: userCredentials });
          })
          .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
              return res.status(400).json({ email: 'Email is already in use' });
            } else if (err.code === 'auth/weak-password') {
              return res
                .status(400)
                .json({ password: 'Password should be at least 6 characters' });
            } else {
              return res.status(500).json({ general: err.message });
            }
          });
      }
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  // == validation data
  const validationResult = validateLoginData(user);
  if (!validationResult.valid)
    return res.status(400).json(validationResult.errors);
  // ==
  let userId = null;
  let token = null;
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      return db
        .collection('users')
        .where('userId', '==', userId)
        .get();
    })
    .then(data => {
      const users = [];
      data.forEach(doc => {
        users.push(doc);
      });
      res.json({
        token,
        user: users[0].data()
      });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res.status(400).json({ password: 'wrong password' });
      } else if (err.code === 'auth/user-not-found') {
        return res.status(400).json({ email: 'user not found' });
      } else {
        return res.status(500).json({ general: err.message });
      }
    });
};

exports.uploadUserImage = (req, res) => {
  const Busboy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new Busboy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
    if (mimeType !== 'image/jpeg' && mimeType !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' });
    }

    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimeType };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on('finish', () => {
    admin
      .storage()
      .bucket(storageBucket)
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimeType
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${imageFileName}?alt=media`;
        console.log(imageUrl);
        db.collection('users')
          .doc(req.user.nickname)
          .update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: 'image uploaded successfully' });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ general: err.message });
      });
  });

  busboy.end(req.rawBody);
};

exports.uploadPostTitleImage = (req, res) => {
  const Busboy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new Busboy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
    if (mimeType !== 'image/jpeg' && mimeType !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' });
    }

    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimeType };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on('finish', () => {
    admin
      .storage()
      .bucket(storageBucket)
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimeType
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${imageFileName}?alt=media`;
        console.log(imageUrl);
        return res.json({ imageUrl });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ general: err.message });
      });
  });

  busboy.end(req.rawBody);
};

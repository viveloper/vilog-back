const { admin, db } = require('../util/firebaseAdmin');

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  let token = null;
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    token = authorizationHeader.split('Bearer ')[1];
  }
  else {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  admin.auth().verifyIdToken(token).then(decodedToken => {
    req.user = decodedToken;
    console.log(decodedToken);
    return db.collection('users').where('userId', '==', req.user.uid).limit(1).get();
  }).then(data => {
    req.user.nickname = data.docs[0].data().nickname;
    return next();
  }).catch(err => {
    console.error('Error while verifying token', err);
    return res.status(403).json(err);
  })
}
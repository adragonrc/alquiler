const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');

var serviceAccount = require("../../alquileres-8d9ed.json");
const e = require('express');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://alquileres-8d9ed.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();

router.get('/home', (req, res) => {
  const sessionCookie = req.cookies.session || "";
  admin.auth()
    .verifySessionCookie(sessionCookie, true)
    .then(()=>{
      console.log("in home")
      res.render('home.html', { title: 'Mi Hogar' });
    })
    .catch((error) =>{
      console.log("home to index");
      res.redirect("/");
    })
})

router.get('/', (req, res) => {
  const sessionCookie = req.cookies.session || "";
  admin.auth()
    .verifySessionCookie(sessionCookie, true)
    .then(()=>{
      console.log("/ -> home");
      res.render('home.html', { title: 'Mi Hogar',  csrfToken: req.csrfToken() });
    })
    .catch((error) =>{
      console.log("/ -> index");
      res.render('index.html', { title: 'Mi Hogar', error: "ERROR_SESSION_COOKIE" , csrfToken: req.csrfToken() });
      
    });
  //  res.render('index.html', { title: 'Mi Hogar' });
})

router.get('/contact', (req, res) => {
  res.render('contact.html', { title: 'Contacto' });
});
router.get('/cuarto', (req, res) => {
  res.render('cuarto.html', { title: 'cuarto' });
});
router.get('/add_room', (req, res) => {
  res.render('add_room.html', { title: 'Agregar' });
});

router.get('/add_alquiler', (req, res) => {
  res.render('add_alquiler.html', { title: 'Agregar' });
});
router.get('/prueba', (req, res) => {
  res.render('dialog1.html', { title: 'Agregar' });
});
router.get('/grafics', (req, res) => {
  res.render('grafics.html', { title: 'Agregar' });
});

router.post("/registrarCasa1", (req, res) =>{
  console.log('body2 =>', req.body);
  
  res.end(JSON.stringify({ status: 'success', data: req.body}));
});

router.post("/registrarCasa", (req, res) => {
  
  console.log('In registrarcasa');
  var body = req.body;
  var mUser = req.body.user;
  let action = req.body.action;
  console.log('body =>', req.body);
  
 // res.end(JSON.stringify({ status: 'success', data: mUser}));
  //res.render('login/login.html', {data: body});

  if (mUser.password == mUser.password2) {
    admin.auth()
    .createUser({
      email: mUser.email,
      emailVerified: false,
      password: mUser.password,
      displayName: 'John Doe',
      disabled: false
    })
    .then(function (userRecord) {
      //res.render("/login/login.html", );
      
      db.collection('hogar')
      .doc(userRecord.uid)
      .set({
        address: mUser.address, 
        city: mUser.city, 
        estado: mUser.estado,
        cep: mUser.cep
      }).then((documentReference)=>{
        console.log('Successfully created new user:', userRecord);
        res.end(JSON.stringify({ status: 'success', data: mUser, newUser: userRecord, newDocument: documentReference}));
      });
    })
    .catch(function (error) {
      console.log('Error creating new user:', error);
    });
  } else {
    res.render('index.html', { title: 'Mi Hogar' });
  }
});

router.post('/sessionLogin', (req, res) => {
  const idToken = req.body.idToken.toString();
    
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().createSessionCookie(idToken, { expiresIn })
    .then((sessionCookie) => {
      // Set cookie policy for session cookie.
      const options = { maxAge: expiresIn, httpOnly: true, secure: false };
      res.cookie('session', sessionCookie, options);
      res.end(JSON.stringify({ status: 'success' }));
      console.log("SessionCreada");
    }, (error) => {
      console.log("UNAUTHORIZED REQUEST!", error);
      res.status(401).send('UNAUTHORIZED REQUEST!');
    });
    
});

router.post('/sessionLogout', (req, res) => {
  res.clearCookie('session');
  res.end(JSON.stringify({ status: 'success' }));
});

module.exports = router;
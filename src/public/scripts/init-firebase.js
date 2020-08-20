
var firebaseConfig = {
    apiKey: "AIzaSyCXumLnZW4O8Y_nDUd6bZmVhQYRgrup9HA",
    authDomain: "alquileres-8d9ed.firebaseapp.com",
    databaseURL: "https://alquileres-8d9ed.firebaseio.com",
    projectId: "alquileres-8d9ed",
    storageBucket: "alquileres-8d9ed.appspot.com",
    messagingSenderId: "1060475592379",
    appId: "1:1060475592379:web:64679062c944ed04f4539e",
    measurementId: "G-6JS17LEKTP"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
var hogarDB;
var data = searchToObject();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log("user", user.email);
      hogarDB = db.collection("hogar").doc(firebase.auth().currentUser.uid);
      userLogin();
    } else {
      console.log("user not fund");
      userNotLogin();
    }
});
function searchToObject() {
    var pairs = window.location.search.substring(1).split("&"),
        obj = {},
        pair,
        i;
  
    for ( i in pairs ) {
      if ( pairs[i] === "" ) continue;
  
      pair = pairs[i].split("=");
      obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
    }
  
    return obj;
}

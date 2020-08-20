var goToHome = true;
const pass1 = document.getElementById('inputPassword');
const pass2 = document.getElementById('inputPassword2');

var currentData;

//pass2.addEventListener('input', updateValue);

function onBlurPassword(e) {
  if (pass1.value.length != pass2.value.length) {
    //pass2.setCustomValidity("mensaje");
    //document.getElementById('form_registro').reportValidity();
  }
}

function validaForm() {
  
  return true;
}

$('#form_registro').submit(function () {
  if (validaForm()) {
    registrar();
    return false;
  }
  return true;
});
function comprobarPassword(valor, campo) {
  //this.value.indexOf("@") < 0
  console.log('valor: ', valor);
  console.log('campo: ', campo);
  var mensaje = "";

  // comprobar los posibles errores
  if (this.value.length < 9) {
    mensaje = "La contraseña es muy corta";
  }

  // mostrar/resetear mensaje (el mensaje se resetea poniendolo a "")
  this.setCustomValidity(mensaje);
}
function comprobarPasswordConfirm(valor, campo) {
  //this.value.indexOf("@") < 0
  console.log('valor: ', valor);
  console.log('campo: ', campo);
  var mensaje = "";

  // comprobar los posibles errores
  if (this.value.length != pass1.value.length) {
    mensaje = "Las contraseñas no coinciden.";
  }
  // mostrar/resetear mensaje (el mensaje se resetea poniendolo a "")
  this.setCustomValidity(mensaje);
}

// cuando se cambie el valor del campo o sea incorrecto, mostrar/resetear mensaje
pass1.addEventListener("invalid", comprobarPassword);
pass2.addEventListener("invalid", comprobarPasswordConfirm);


function getCookie(name) {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}

function registrar() {
  var jsonData = $('#form_registro').serializeArray()
    .reduce(function (a, z) {
      a[z.name] = z.value;
      return a;
    }, {});
  console.log(jsonData);
  $.ajax({
    beforeSend: function (qXHR, settings) {
      console.log("1. before send");
    },
    complete: function () {
      console.log("3. complete");
    },
    type: "POST",
    url: "/registrarCasa",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": Cookies.get("XSRF-TOKEN"),
    },
    data: JSON.stringify({ action: "register", user: jsonData }),
    success: function (resData) {
      console.log("2. succes =>", resData);
      var data = JSON.parse(resData);
      if (data.status == 'success') {
        window.location.hash = '#openModal';
        currentData = data.data;
      }
    },

    error: function (xhr, status, errorThrown) {
      var r = jQuery.parseJSON(xhr.responseText);
      alert('Error : ' + r.data);
    }
  });
}


function userLogin() {
  var s = Cookies.get("session");
  if (goToHome) {
    console.log("user is login");
    signOut();
    window.location.assign("/home");
  }
}

function autoSignIn() {
  if (currentData) {
    doLogin(currentData.email, currentData.password);
  } else {
    alert("Ingrese su correo y contraseña");
  }
}

function userNotLogin() {
  var s = Cookies.get("session");
  var s1 = Cookies.get("session");
}
function doLogin(email, password) {
  if (!email || !password) return;
  goToHome = false;
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(
    function () {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(({ user }) => {
          return user.getIdToken().then((idToken) => {
            return fetch("/sessionLogin", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
              },
              body: JSON.stringify({ idToken }),
            });
          });
        })
        .then(() => {
          window.location.assign("/home");
        })
        .catch(function (error) {
          goToHome = true;
          alert("No se pudo iniciar la sesion");
          console.log("error login", error);
        });
    }
  );
  return false;
}
function login() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  doLogin(email, password);
}


function signOut() {
  goToIndex = false;
  firebase.auth().signOut().then(function () {
    fetch("/sessionLogout", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "text/html",
        "CSRF-Token": Cookies.get("XSRF-TOKEN"),
      },
    }).then(function (res) {
      if (res.ok)
        window.location.assign("/");
      else {
        alert("No se pudo cerrar la sesion");
        goToIndex = true;
      }
    });
    console.log("Front - logout");
  }).catch(function (error) {
    goToIndex = true;
    alert("No se pudo cerrar la sesion");
    console.log("error logout", error);
  });
}
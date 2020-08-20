
var goToIndex = true;

function userLogin(){
    console.log("user:", firebase.auth().currentUser);
}

function userNotLogin(){
    if(goToIndex){
        console.log("user not login");
        window.location.assign("/");
    }
}

function addRom(){
    var uid = firebase.auth().currentUser.uid;
    var numero = document.getElementById("numero").value;
    var cuarto = {
        descripcion : document.getElementById("descripcion").value
    }
    var cuartoRef = db.collection("hogar").doc(uid).collection("cuartos").doc(numero);
    cuartoRef.set(cuarto).then(function() {
        console.log("Document successfully written!");
        alert("agregado");
    }).catch(function(error){
        console.log(error);
    });
}
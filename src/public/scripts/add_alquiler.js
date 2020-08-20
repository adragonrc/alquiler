var goToIndex = true;
var listUsers = new Array();
var listUsersToAlquiler = new Array();

var fechaDeInicio;

const numeroCuarto = data[SEARCH_ROOM_NUM];
const container = document.getElementById("usersList");
document.getElementById('date').valueAsDate = new Date();
var date =new Date();
var hora = date.getHours();
var min = date.getMinutes();
var hour = (hora<10 ? "0"+hora: hora) + ":"+ (min < 10 ? "0"+ min : min);
document.getElementById('time').value = hour;
function userLogin(){
    console.log("user:", firebase.auth().currentUser);
    if(numeroCuarto){
        getCuartoReference(numeroCuarto)
        .get()
        .then((docRoom)=>{ 

           if(docRoom.exists){
               var x = docRoom.data().alquilerCurrent;
               if(x != null){
                   alert("Cuarto ya alquilado");
                   window.location.assign("/cuarto?" + SEARCH_ROOM_NUM+"="+numeroCuarto);
               }
           }
        });
    }else{
        alert("Enlace no permitido");
    }
}
function userNotLogin(){
    if(goToIndex){ 
        console.log("user not login");
        window.location.assign("/");
    }
}
/*
<div class="container userItem">
    <div class="col">
        <h5 class="row">Alexander</h5>
        <h6 class="row">123456</h6>
    </div>
    <div class="col" onclick="remove(0)">
        <svg viewBox="0 0 24 24" focusable="false"  style="pointer-events: none; display: block; width: 100%; height: 100%;">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
        <img src="/image/delete.png" class="image">
    </div>
</div>
*/
function createItemUserLabel(user, numItem){
    var item = document.createElement("DIV");
    var col1 = document.createElement("DIV");
    var col2 = document.createElement("DIV");

    var h5 = document.createElement("h5");
    var h6 = document.createElement("h6");
    
    
    item.setAttribute("class", "container userItem");
    item.setAttribute("id", user.dni);

    col1.setAttribute("class", "item");
    col2.setAttribute("onclick", "remove("+user.dni+")");

    h5.setAttribute("class", "row text");
    h5.innerHTML = user.nombres  + ", " + user.apePat + " "+user.apeMat;
    h6.setAttribute("class", "row text");
    h6.innerHTML = user.dni;

    col1.appendChild(h5);
    col1.appendChild(h6);
    col2.innerHTML ="<svg viewBox='0 0 24 24' focusable='false'  class='image'><path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/></svg>"
    
    item.appendChild(col1);
    item.appendChild(col2);
    return item;
}

function findUser(dni){
    for(var i = 0; i<listUsersToAlquiler.length; i++){
        if(listUsersToAlquiler[i].dni == dni){
            return i;
        }
    }
    return -1;
}
function remove(dni){
    var pos = findUser(dni);
    if(pos != -1){
        var item = document.getElementById(dni);
        item.style.display = "none";
        container.removeChild(item);
        listUsers.splice(pos,1);
        listUsersToAlquiler.splice(pos,1);

    }
}
function addUser(){
    var mdni = document.getElementById("dni").value;
    var pos = findUser(mdni);
    if(pos == -1){
        var user = {
            dni : mdni,
            nombres : document.getElementById("nombres").value,
            apePat : document.getElementById("apePat").value,
            apeMat : document.getElementById("apeMat").value,
            correo : document.getElementById("correo").value,
            tel : document.getElementById("tel").value
        }
        container.appendChild(createItemUserLabel(user, listUsers.length));
        listUsers.push(user);
        listUsersToAlquiler.push({dni : user.dni, activo : true});
    }else{
        alert("Usuario ya existe");
    }
}
function newAlquiler(user, numCuarto){
    
}
function retro(error){
    console.log("error: ", error);
}


function crearAlquiler(){
    if(numeroCuarto){
        var pago = document.getElementById("rbtOp1").checked;
        var numPagos = 0;
        if(pago){
            numPagos++;
        }
        var alquiler = {
            numCuarto : numeroCuarto,
            inicio : getDateTimeOnView(),
            inquilinos: listUsersToAlquiler,
            numeroDePagos: numPagos
            //other thinks;
        }
        hogarDB.collection("alquileres")
            .add(alquiler)
            .then((alquilerRef)=>{
                listUsers.forEach(function(user){
                    getUserReference(user.dni)
                        .set(user)
                        .catch(retro)
                });
                addMensualidad(mensualidad, alquilerRef);
            })
            .catch(retro);
        
    }
}

function updateCurrentAlquilerOfCuarto(alquilerRef){
    getCuartoReference(numeroCuarto)
    .update({alquilerCurrent: alquilerRef.id})
    .then(addAlquilerFinished);
}

function addAlquilerFinished(){
    window.location.assign("/cuarto?" + SEARCH_ROOM_NUM+"="+numeroCuarto);
}

function addMensualidad(mensualidad, alquilerRef){
    var precio = document.getElementById("mensualidad").value;
    var pago = document.getElementById("rbtOp1").checked;
    var mensualidad = {
        costo: precio,
        inicio : getDateTimeOnView()
    }
    alquilerRef.collection(MENSUALIDAD_COLLECTION)
    .add(mensualidad)
    .then((docMensualidad)=>{
        alquilerRef
        .update({mensualidadCurrent: docMensualidad.id})
        .then(()=>{
            if(pago){
                addPago(docMensualidad, alquilerRef);
            }else{
                updateCurrentAlquilerOfCuarto(alquilerRef)
            }
        })
    })
}

function addPago(docMensualidad, alquilerRef){
    var precio = document.getElementById("mensualidad").value;
    var newPago = {
        fecha : getDateTimeOnView(),
        monto : precio
    }
    var newPago2 = {
        fecha : getDateTimeOnView(),
        monto : precio,
        mensualidad: docMensualidad.id,
        alquiler: alquilerRef.id,
        cuarto: numeroCuarto
    }
    addPagoGlobal(newPago2).then((pagoRef)=>{
        console.log("payment added successfully");
    });
    addPagoLocal(newPago, docMensualidad).then((newPago)=>{
        updateCurrentAlquilerOfCuarto(alquilerRef)
    })
}

//functions to get data.
function getDateTimeOnView(){
    if(!fechaDeInicio){
        var date = document.getElementById("date").value;
        var time = document.getElementById("time").value;
        fechaDeInicio = new Date(date + " " + time);
    }
    return fechaDeInicio;
}
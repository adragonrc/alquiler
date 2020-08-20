const USERS_COLLECTION = "users";
const ROOM_COLLECTION = "cuartos";
const HOME_REFERENCE = "hogar";
const ALQUILER_COLLECTION = "alquileres";
const MENSUALIDAD_COLLECTION = "mensualidad";
const PAGOS_COLLECTION = "pagos";

//get colentions functions
function getUsersColection(){
    return db.collection(USERS_COLLECTION);
}
function getCuartoColection(){
    return hogarDB.collection(ROOM_COLLECTION);
}

function getAlquilerColection(){
    return hogarDB.collection(ALQUILER_COLLECTION);
}
function getPagosCollection(){
    return hogarDB.collection(PAGOS_COLLECTION);
}

//get reference functions
function getCuartoReference(numero){
    return getCuartoColection().doc(numero);
}
function getUserReference(dni){
    return getUsersColection().doc(dni);
}

function getAlquilerReferenceByID(idAlquiler){
    return getAlquilerColection(idAlquiler).doc(idAlquiler);
}

//Get data functions
function getAllPagos(){
    return getPagosCollection().get();
}


//Add data functions
function addPagoLocal(data, mensualidadReference){
    return mensualidadReference.collection(PAGOS_COLLECTION).add(data);
}
function addPagoGlobal(data){
    return hogarDB.collection(PAGOS_COLLECTION).add(data)
}
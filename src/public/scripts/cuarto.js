var goToIndex = true;

var roomNum = data[SEARCH_ROOM_NUM];

var idAlquiler;

var btRemoveRental = document.getElementById("btRemoveRental");

var state;

/**Data */
var docAlquiler;
var docMensualidad;
var docCuarto;
var listUsers;

function userLogin(){
    console.log("user:", firebase.auth().currentUser);
    showCuarto();
}
/*
    <tr>
        <th scope="row">1</th>
        <td>Mark</td>
        <td>Otto</td>
        <td>@mdo</td>
    </tr>
 */

function userNotLogin(){
    console.log("user is not defined");
}
function createRow(userDoc){
    console.log("User", userDoc);
    var tr = document.createElement("TR");
    var th = document.createElement("TH");
    var tdNombres = document.createElement("TD");
    var tdCorreo = document.createElement("TD");

    th.setAttribute("scope","row");
    th.innerHTML = userDoc.dni;
    tdNombres.innerHTML = userDoc.nombres;
    tdCorreo.innerHTML = userDoc.correo;
    
    tr.appendChild(th);
    tr.appendChild(tdNombres);
    tr.appendChild(tdCorreo);

    return tr;
}

function showCuarto(){
    if(roomNum){
        document.getElementById("idNumero").value = roomNum;
        getCuartoReference(roomNum)
        .get()
        .then((cuartoDocument)=>{
            docCuarto = cuartoDocument;
            var alquiler = cuartoDocument.data().alquilerCurrent;
            if(alquiler != null){
                getAlquilerReferenceByID(alquiler)
                .get()
                .then((alquilerDocument)=>{
                    occupiedRoom();
                    docAlquiler = alquilerDocument;
                    idAlquiler = alquilerDocument.id;
                    // doc.data() is never undefined for query doc snapshots
                    console.log(alquilerDocument.id, " => ", alquilerDocument.data());

                    var dataAlquiler = alquilerDocument.data();
                   
                    showTenants(alquilerDocument);
                    alquilerDocument.ref.collection(MENSUALIDAD_COLLECTION).doc(dataAlquiler.mensualidadCurrent)
                    .get()
                    .then((mensualidadDocument)=>{
                        docMensualidad = mensualidadDocument;
                        var dataMensualidad = mensualidadDocument.data();
                        var doc_start_date = document.getElementById("start_date");
                        var doc_payment_date = document.getElementById("payment_date");
                        var doc_amount = document.getElementById("amount");
                        var doc_state = document.getElementById("state");
                        
                        var today = new Date();
                        var start_date = dataAlquiler.inicio.toDate();
                        var payment_date = dataAlquiler.inicio.toDate().addMonths(dataAlquiler.numeroDePagos);

                        state = (compareDate(payment_date, today) >= 1);
                        
                        doc_amount.innerHTML = "S/"+ dataMensualidad.costo;
                        doc_start_date.innerHTML = start_date.toLocaleDateString("es-PE");
                        doc_payment_date.innerHTML = payment_date.toLocaleDateString("es-PE");
                        doc_state.style.display = state? "block" : "none";

                    })
                })
                .catch((Error)=>{
                    console.log("log",Error);
                })
            }else{
                freeRoom();
            }  
        });
    }else{
        alert("Enlace no entontrado");
    }
}

function addPayment(){
    if(state){
        var precio = docMensualidad.data().costo;
        var date = new Date();
        var newPago = {
            fecha : date,
            monto : precio
        }
        var newPago2 = {
            fecha : date,
            monto : precio,
            mensualidad: docMensualidad.id,
            alquiler: docAlquiler.id,
            cuarto: roomNum
        }
        addPagoGlobal(newPago2)
        .then((pagoRef)=>{
            console.log("payment added successfully");
        })
        docMensualidad.ref.collection(PAGOS_COLLECTION)
        .add(newPago)
        .then((pagoRef)=>{
            alert("Listo ;)");
            docAlquiler.ref.update({numeroDePagos: docAlquiler.data().numeroDePagos+1})
            .then(()=>{
                document.getElementById("state").style.display ="none";
            });
        })
    }
}

function showDataOfMensualidad(){
    
}
 
function showTenants(alquilerDocument){
    var tbody = document.getElementById("tBody");
    alquilerDocument.data().inquilinos.forEach((user) =>{
        getUserReference(user.dni)
        .get()
        .then((userDoc)=>{
            tbody.append(createRow(userDoc.data()));
        })
        .catch((Error)=>{
            console.log("log",Error);
        })
    })
}

function freeRoom(){
    document.getElementById("btAddRental").style.display = "block";
    document.getElementById("description_box").style.display = "block";
    document.getElementById("header_box").style.display = "none";
    document.getElementById("table").style.display = "none";
    btRemoveRental.style.display = "none";
}

function occupiedRoom(){
    document.getElementById("description_box").style.display = "block";
    document.getElementById("header_box").style.display = "block";
    document.getElementById("btAddRental").style.display = "none";
    document.getElementById("table").style.display = "table";
    btRemoveRental.style.display = "block";
}

function removeRental(){
    if(idAlquiler){
        getCuartoReference(roomNum)
        .update({alquilerCurrent: null})
    
        getAlquilerReferenceByID(idAlquiler)
        .update({activo: false})
        .then(()=>{
            showCuarto();
        });
    }
}
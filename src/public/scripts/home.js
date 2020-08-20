var goToIndex = true;

document.getElementById("contCuartos").style.display = "none";

function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}
function userLogin(){
    console.log("user:", firebase.auth().currentUser);
    showCuartos();
}
function userNotLogin(){
    if(goToIndex){
        fetch("/sessionLogout", {
            method: "POST",
            headers: {
            Accept: "application/json",
            "Content-Type": "text/html",
            "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
        }).then(function(res){
            if(res.ok)
                window.location.assign("/");
            else{
                alert("No se pudo cerrar la sesion");
                goToIndex = true;   
            }
        });
    }
}
function createRomLabel(numero, data){
    
    var form = document.createElement("FORM");
    form.setAttribute("action", "/cuarto");
    form.setAttribute("method", "GET");
    
    var num = document.createElement("INPUT");
    num.setAttribute("type", "hidden");
    num.setAttribute("name", SEARCH_ROOM_NUM);
    num.setAttribute("value", numero);

    var div = document.createElement("DIV");
    
    div.setAttribute("class", "card");
    div.setAttribute("onClick", "javascript:this.parentNode.submit()");

    var img = document.createElement("IMG");
    img.setAttribute("src", "/image/logo.png");
    img.setAttribute("alt", "Pews Logo");
    img.setAttribute("class", "animate__bounceIn image");

    
    var divL = document.createElement("DIV");
    
    divL.innerHTML = "Cuarto: "+ numero;

    div.appendChild(img);
    div.appendChild(divL);
    form.appendChild(div);
    form.appendChild(num);

    return form;
/* <form action="/cuarto" method="GET">
                    <input type="hidden" name="numero" value="05">
                    <div class="card"  onclick="javascript:this.parentNode.submit()">
                        <img 
                            src = "/image/logo.png" 
                            alt = "Pews Logo " 
                            class="animate__bounceIn image">
                        <div>
                            <label>Cuarto: 05</label>
                        </div>
                    </div>
                </form>
*/
                    
}
function showCuartos(){
    var cuartosRef = db.collection("hogar").doc(firebase.auth().currentUser.uid).collection("cuartos");
    var contenedor = document.getElementById("contCuartos");
    cuartosRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            
            contenedor.appendChild(createRomLabel(doc.id, doc.data()));
        });
        document.getElementById("contCuartos").style.display = "grid";
        document.getElementById("loader").style.display = "none";
        
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}

function signOut(){
    goToIndex = false;
    firebase.auth().signOut().then(function () {
        fetch("/sessionLogout", {
                method: "POST",
                headers: {
                Accept: "application/json",
                "Content-Type": "text/html",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
            }).then(function(res){
                if(res.ok)
                    window.location.assign("/");
                else{
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
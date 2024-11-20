const authToken = localStorage.getItem("AuthToken");
const userName = localStorage.getItem("userName");
document.addEventListener("DOMContentLoaded", function () {

    if (authToken && userName) {
        document.getElementById("userName").textContent = userName;
        document.getElementById("logged-in-user-dropdown").style.display = "inline";
        document.getElementById("profileLink").setAttribute("href", "/users/" + localStorage.getItem("userId"));
    } else {
        document.getElementById("logged-in-user-dropdown").style.display = "none";
    }
});

/*document.addEventListener("DOMContentLoaded", function () {
    fetch("/user-process/current-user", {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Kullanıcı bilgisi alınamadı");
            }
        })
        .then(data => {
            if (data.success) {
                document.getElementById("userName").textContent = data.userName;
                document.getElementById("logged-in-user-dropdown").style.display = "inline";
                document.getElementById("profileLink").setAttribute("href", "/users/" + data.userId);
            } else {
                document.getElementById("logged-in-user-dropdown").style.display = "none";
            }
        })
        .catch(error => {
            console.error("Kullanıcı bilgisi alınamadı:", error);
            document.getElementById("logged-in-user-dropdown").style.display = "none";
        });
});*/



/*document.addEventListener("DOMContentLoaded", function () {
    if (authToken && userName) {
        document.getElementById("userName").textContent = userName;
        document.getElementById("logged-in-user-dropdown").style.display = "inline";
    } else {
        document.getElementById("logged-in-user-dropdown").style.display = "none";
    }
});*/

document.getElementById("logoutButton").addEventListener("click", function () {
    fetch("/user-process/logout" , {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        credentials: "include"
    })
    .then(response => {
        if(response.ok){
            localStorage.removeItem("AuthToken");
            localStorage.removeItem("userName");
            localStorage.removeItem("userId");
            window.location.href = "/home";
        }else{
            console.error("Çıkış yapma başarısız");
        }
    })
});

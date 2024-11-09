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
    if (authToken && userName) {
        document.getElementById("userName").textContent = userName;
        document.getElementById("logged-in-user-dropdown").style.display = "inline";
    } else {
        document.getElementById("logged-in-user-dropdown").style.display = "none";
    }
});*/

document.getElementById("logoutButton").addEventListener("click", function () {
    localStorage.removeItem("AuthToken");
    localStorage.removeItem("userName");
    document.cookie = "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/home";
});

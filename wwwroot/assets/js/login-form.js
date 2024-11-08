document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email-login").value;
        const password = document.getElementById("password-login").value;

        const formData = new URLSearchParams();
        formData.append("Email", email);
        formData.append("Password", password);

        fetch("/user-process/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Giriş başarısız!");
                }
            })
            .then(data => {
                console.log("Başarılı giriş:", data);
                window.location.href = "/home";
            })
            .catch(error => {
                console.error("Giriş hatası:", error);
                alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
            });
    });
});

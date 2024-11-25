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
                if (data.success) {
                    window.location.href = "/home";
                    localStorage.setItem("userName", data.userName);
                    localStorage.setItem("AuthToken", data.authToken);
                    localStorage.setItem("userId", data.userId);
                }
            })
            .catch(error => {
                console.error("Giriş hatası:", error);
                alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
            });
    });

    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const fullName = document.getElementById("name-register").value;
        const email = document.getElementById("email-register").value;
        const password = document.getElementById("password-register").value;

        const names = fullName.split(" ");
        const name = names[0];
        let midName = "";
        let surname = "";

        if (names.length > 2) {
            surname = names[names.length - 1];
            midName = names.slice(1, -1).join(" ");
        } else if (names.length === 2) {
            surname = names[1];
        }

        const userRegisterData = {
            "Id": "",
            "AuthDocNumber": 0,
            "Email": email,
            "Description": "",
            "FacebookLink": "",
            "InstagramLink": "",
            "Role": "",
            "MidName": midName,
            "Name": name,
            "Password": password,
            "PhoneNumber": "",
            "Surname": surname,
            "ImgPath": ""
        }
        

        fetch("/user-process/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userRegisterData)
        })
            .then(response => {
                
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Kayıt olma başarısız!");
                }
            })
            .then(data => {
                if (data.success) {
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
                            if (data.success) {
                                window.location.href = "/home";
                                localStorage.setItem("userName", data.userName);
                                localStorage.setItem("AuthToken", data.authToken);
                                localStorage.setItem("userId", data.userId);
                            }
                        })
                        .catch(error => {
                            console.error("Giriş hatası:", error);
                            alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
                        });
                }
            })
            .catch(error => {
                console.error("Kayit olma hatası:", error);
                alert("Kayıt olma başarısız! Lütfen tekrar deneyin.");
            });
    });
});

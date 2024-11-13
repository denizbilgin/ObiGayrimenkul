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

    registerForm.addEventListener("submit" , function(event) {
        const fullName = document.getElementById("name-register");
        const email = document.getElementById("email-register");
        const password = docuemnt.getElementById("password-register");
        const names = fullName.split(" ");
        const formData = new URLSearchParams();
        const name = names[0];
        if(names.length > 2){
            const surname = names[names.length - 1];
            for(var i = 1 ; i < names.length - 2 ; i++){
                const midname = " " + i;
            }
        }else{
            const surname = names[1];
        }
        const userRegisterData = {
            "Id": "",
            "auth_doc_number": 0,
            "email": email,
            "description": "",
            "facebook_link": "",
            "instagram_link": "",
            "role": "",
            "mid_name": midname? midname : "",
            "name": name,
            "password": password,
            "phone_number": "",
            "surname": surname,
            "img_path": ""
          }
          
        fetch("/user-process/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: userRegisterData
        })
            .then(response => {
                console.log(userRegisterData);
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Kayıt olma başarısız!");
                }
            })
            .then(data => {
                console.log("Kayit olundu:", data);
                if (data.success) {
                    fetch("/user-process/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: {
                            "Email" : email,
                            "Password" : password
                        }
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

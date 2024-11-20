import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const getUserById = async (id) => {
    const url = `/users/get-details/${id}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            console.log("Kullanıcı bulunamadı");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

export async function updateUser(isImgUpdate){
    const path = window.location.pathname;
    const userId = path.split('/').pop();
    const url = `/users/edit/${userId}`;
    const user = await getUserById(userId);

    let imgName = "";
    if (isImgUpdate) {
        imgName = "user_photos/" + document.getElementById("user-picture").getAttribute("user-filename");
    } else {
        imgName = user.imgPath
    }

    const userData = {
        Id: userId,
        Name: document.getElementById("user-firstname").value,
        MidName: document.getElementById("user-midname").value,
        Surname: document.getElementById("user-lastname").value,
        AuthDocNumber: document.getElementById("user-document-number").value,
        Email: document.getElementById("user-email").value,
        ImgPath: imgName,
        FacebookLink: document.getElementById("user-facebook-link").value,
        InstagramLink: document.getElementById("user-instagram-link").value,
        PhoneNumber: document.getElementById("user-phone-number").value,
        Description: document.getElementById("user-description").value,
        Password: user.password,
        Role: user.role
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            console.log("Kullanıcı bilgileri başarıyla güncellendi.");
            window.location.href = `/users/${userId}`;
        } else {
            console.log("Kullanıcı bilgileri güncellenemedi.");
        }
    } catch (error) {
        console.error("Hata:", error);
    }
};

const getFirebaseConfigurations = async () => {
    const url = '/fbase/obidatabase-3e651-firebase-adminsdk-ta9fl-2ef236de49';

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Firebase yapılandırması alınamadı");
        }

        const firebaseConfig = await response.json();
        const app = initializeApp(firebaseConfig);
        
        return app
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

const getUserPhotoFromStorage = async (app, user) => {
    const storage = getStorage(app);

    const userImageRef = ref(storage, user.imgPath);
    try {
        const userImageUrl = await getDownloadURL(userImageRef);
        return userImageUrl;
    } catch (error) {
        const defaultImageRef = ref(storage, 'user_photos/default_user_photo.jpg');
        const defaultImageUrl = await getDownloadURL(defaultImageRef);
        return defaultImageUrl;
    }
};

document.addEventListener("DOMContentLoaded", async function() {
    const path = window.location.pathname;
    const userId = path.split('/').pop();
    const user = await getUserById(userId);
    if (user){
        const app = await getFirebaseConfigurations();
        console.log(user);

        document.getElementById("user-header-name").innerHTML = user.name + (user.midName === "" ? "": " " + user.midName)  + " " + user.surname;
        document.getElementById("user-firstname").value = user.name;
        document.getElementById("user-midname").value = user.midName;
        document.getElementById("user-lastname").value = user.surname;
        document.getElementById("user-document-number").value = user.authDocNumber;
        document.getElementById("user-email").value = user.email;
        document.getElementById("user-facebook-link").value = user.facebookLink;
        document.getElementById("user-instagram-link").value = user.instagramLink;
        document.getElementById("user-phone-number").value = user.phoneNumber;
        document.getElementById("user-description").value = user.description;

        const userImageUrl = await getUserPhotoFromStorage(app, user);
        document.getElementById("user-picture").src = userImageUrl;
        document.getElementById("user-picture").style.height = "100%";

        document.getElementById("info-save-button").addEventListener("click", function() {
            updateUser(false)
        });


        document.getElementById("wizard-picture").addEventListener("change", async function(event) {
            const file = event.target.files[0];
            if (file) {
                const storage = getStorage(app);
                const userFirstName = document.getElementById("user-firstname").value;
                const userLastName = document.getElementById("user-lastname").value;
                const fileName = `${userFirstName}-${userLastName}-${new Date().getTime()}.jpg`;
                const storageRef = ref(storage, "user_photos/" + fileName);

                const uploadTask = uploadBytesResumable(storageRef, file);
                uploadTask.on("state_changed",
                    (snapshot) => {
                        // Yükleme ilerleme durumu burada ele alınabilir
                        // Örneğin: progress bar eklemek
                    },
                    (error) => {
                        // Hata durumunda yapılacaklar
                        console.error("Yükleme hatası:", error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        document.getElementById("user-picture").setAttribute("src", downloadURL);
                        document.getElementById("user-picture").setAttribute("user-filename", fileName);
                        await updateUser(true);
                    }
                )
            }
        });
    }
});
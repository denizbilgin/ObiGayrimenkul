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
    const ugur = await getUserById("3t5SEXDiNhFY0QHZO4n6");
    const emrah = await getUserById("WdgBYcJlYj9oox6hb1yE");

    if (ugur && emrah) {
        const app = await getFirebaseConfigurations();

        // Uğur Bilgin
        const ugurImageUrl = await getUserPhotoFromStorage(app, ugur);
        document.getElementById("ugur-picture").setAttribute("src", ugurImageUrl);
        document.getElementById("ugur-name").innerHTML = ugur.name + (ugur.midName === "" ? "": " " + ugur.midName)  + " " + ugur.surname;
        document.getElementById("ugur-description").innerHTML = ugur.description;
        let ugurFormattedPhoneNumber = ugur.phoneNumber.replace(/^\+90/, "0");
        ugurFormattedPhoneNumber = ugurFormattedPhoneNumber.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
        document.getElementById("ugur-phone-number").innerHTML = ugurFormattedPhoneNumber;
        document.getElementById("ugur-facebook-link").setAttribute("href", ugur.facebookLink);
        document.getElementById("ugur-instagram-link").setAttribute("href", ugur.instagramLink);
        document.getElementById("ugur-info").innerHTML = "<strong>" + ugur.name + " " + ugur.surname + "</strong>: " + ugurFormattedPhoneNumber;

        // Emrah Oğuz
        const emrahImageUrl = await getUserPhotoFromStorage(app, emrah);
        document.getElementById("emrah-picture").setAttribute("src", emrahImageUrl);
        document.getElementById("emrah-name").innerHTML = emrah.name + (emrah.midName === "" ? "": " " + emrah.midName)  + " " + emrah.surname;
        document.getElementById("emrah-description").innerHTML = emrah.description;
        let emrahFormattedPhoneNumber = emrah.phoneNumber.replace(/^\+90/, "0");
        emrahFormattedPhoneNumber = emrahFormattedPhoneNumber.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
        document.getElementById("emrah-phone-number").innerHTML = emrahFormattedPhoneNumber;
        document.getElementById("emrah-facebook-link").setAttribute("href", emrah.facebookLink);
        document.getElementById("emrah-instagram-link").setAttribute("href", emrah.instagramLink);
        document.getElementById("emrah-info").innerHTML = "<strong>" + emrah.name + " " + emrah.surname + "</strong>: " + emrahFormattedPhoneNumber;
    }
});
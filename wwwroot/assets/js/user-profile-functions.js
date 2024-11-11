import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const getUserById = async (id) => {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCyAaYIkN3pDw7L-5BoYclpbNtwPnhbNnU",
        authDomain: "obidatabase-3e651.firebaseapp.com",
        databaseURL: "https://obidatabase-3e651-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "obidatabase-3e651",
        storageBucket: "obidatabase-3e651.appspot.com",
        messagingSenderId: "636529667392",
        appId: "1:636529667392:web:c4996d9c3d9f7324c61ea5",
        measurementId: "G-FK8D85WJKV"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("User bulunamadı.");
            return null;
        }
    } catch (error) {
        console.error("User alınırken hata oluştu:", error);
        throw error;
    }
}

export async function updateUser(){
    const path = window.location.pathname;
    const userId = path.split('/').pop();
    const url = `/users/edit/${userId}`;
    const user = await getUserById(userId);
    console.log(user);

    const userData = {
        Id: userId,
        Name: document.getElementById("user-firstname").value,
        MidName: document.getElementById("user-midname").value,
        Surname: document.getElementById("user-lastname").value,
        AuthDocNumber: document.getElementById("user-document-number").value,
        Email: document.getElementById("user-email").value,
        ImgPath: "aaaaa",
        FacebookLink: document.getElementById("user-facebook-link").value,
        InstagramLink: document.getElementById("user-instagram-link").value,
        PhoneNumber: document.getElementById("user-phone-number").value,
        Description: document.getElementById("user-description").value,
        Password: user.password,
        Role: user.role
    };
    console.log(userData);

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
            //window.location.href = `/users/${userId}`;
        } else {
            console.log("Kullanıcı bilgileri güncellenemedi.");
        }
    } catch (error) {
        console.error("Hata:", error);
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const path = window.location.pathname;
    const userId = path.split('/').pop();
    const user = await getUserById(userId);
    if (user){
        console.log(user);

        document.getElementById("user-header-name").innerHTML = user.name + (user.mid_name === "" ? "": " " + user.mid_name)  + " " + user.surname;
        document.getElementById("user-firstname").value = user.name;
        document.getElementById("user-midname").value = user.mid_name;
        document.getElementById("user-lastname").value = user.surname;
        document.getElementById("user-document-number").value = user.auth_doc_number;
        document.getElementById("user-email").value = user.email;
        document.getElementById("user-facebook-link").value = user.facebook_link;
        document.getElementById("user-instagram-link").value = user.instagram_link;
        document.getElementById("user-phone-number").value = user.phone_number;
        document.getElementById("user-description").value = user.description;
    }
});
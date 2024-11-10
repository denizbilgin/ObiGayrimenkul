import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const getUserById = async (db, id) => {
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

document.addEventListener("DOMContentLoaded", async function() {
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
    const storage = getStorage(app);

    const path = window.location.pathname;
    const userId = path.split('/').pop();
    const user = await getUserById(db, userId);
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
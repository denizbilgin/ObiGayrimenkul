import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

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

// Firebase initializing
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// List all documents
document.addEventListener("DOMContentLoaded", function () {
    const storageRef = ref(storage, "documents"); // Belgelerin yüklü olduğu klasör

    listAll(storageRef).then(result => {
        const advertsContainer = document.getElementById("documents-container");
        advertsContainer.innerHTML = ""; // Eski içerikleri temizle
        result.items.forEach(fileRef => {
            // Her bir dosya için URL'yi al
            getDownloadURL(fileRef).then(url => {
                const documentPartHtml = `
                    <div class="clearfix padding-top-40">
                        <h3>Belge: ${fileRef.name}</h3>
                        <iframe src="${url}" width="100%" height="600px"></iframe>
                    </div>`;
                advertsContainer.innerHTML += documentPartHtml;
            }).catch(error => console.error("Error retrieving URL:", error));
        });
    }).catch(error => console.error("Error listing documents:", error));
});


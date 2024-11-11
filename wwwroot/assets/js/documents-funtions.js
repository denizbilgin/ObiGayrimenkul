import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

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

// List all documents
document.addEventListener("DOMContentLoaded", async function () {
    // Firebase initializing
    const app = await getFirebaseConfigurations();
    const storage = getStorage(app);


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


import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


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

const getPlaceNameById = async (db, placeId) => {
    try {
        const docRef = doc(db, 'district_and_quarters', String(placeId));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.sehir_ilce_mahalle_adi;
        } else {
            console.log(`${placeId} IDsine sahip belge bulunamadı.`);
            return null;
        }
    } catch (error) {
        console.error("Hata oluştu: ", error);
        return null;
    }
};

document.addEventListener("DOMContentLoaded", async function () {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);
    const requestsContainer = document.getElementById("requests-container");

    try {
        const requestsCollection = collection(db, "client-requests");
        const snapshot = await getDocs(requestsCollection);

        if (snapshot.emty) {
            requestsContainer.innerHTML = `<p>Şuanda hiç müşterilerden gelen ilan isteği bulunmamaktadır</p>`;
        } else {
            for (const doc of snapshot.docs) {
                const requestData = doc.data();
                console.log(requestData);

                const districtName = await getPlaceNameById(db, requestData.district_id);
                const quarterName = await getPlaceNameById(db, requestData.quarter_id);

                const card = document.createElement("div");
                card.innerHTML = `
                    <div class="request-card col-md-4">
                        <div class="request-card-header">
                            <h4 class="request-card-title">${requestData.name || "İsimsiz İstek"}</h4>
                            <div class="request-card-subtitle"><i class="fa fa-phone"></i> ${requestData.phone_number || "Belirtilmemiş"}</div>
                        </div>
                        <div class="request-card-body">
                            <ul class="request-card-info-list">
                                <li><i class="fa fa-map-marker"></i> <b>İlçe-Mahalle:</b> ${districtName} / ${quarterName}</li>
                                <li><i class="fa fa-info-circle"></i> <b>Durum:</b> ${requestData.status}</li>
                                <li><i class="fa fa-tag"></i> <b>Fiyat:</b> ${requestData.price} TL</li>
                                <li><i class="fa fa-building"></i> <b>Bina Yaşı:</b> ${requestData.building_age || "Belirtilmemiş"}</li>
                                <li><i class="fa fa-money"></i> <b>Aidat:</b> ${requestData.dues || "0 TL"}</li>
                                <li><i class="fa fa-fire"></i> <b>Isınma Tipi:</b> ${requestData.heating || "Belirtilmemiş"}</li>
                                <li><i class="fa fa-bed"></i> <b>Eşyalı Mı?:</b> ${requestData.is_furnished ? "Evet" : "Hayır"}</li>
                                <li><i class="fa fa-th-large"></i> <b>Kaç Oda - Kaç Salon:</b> ${requestData.number_of_rooms || "Belirtilmemiş"}</li>
                                <li><i class="fa fa-arrows-alt"></i> <b>Daire M²:</b> ${requestData.square_meter || "Belirtilmemiş"}</li>
                                <li><i class="fa fa-building"></i> <b>Dairenin Bulunduğu Kat:</b> ${requestData.which_floor || "Belirtilmemiş"}</li>
                            </ul>
                            <div class="request-card-footer">
                                <b>Diğer Bilgiler:</b>
                                <p>${requestData.other_informations || "Açıklama yok"}</p>
                            </div>
                        </div>
                        <small class="text-muted d-block text-end" style="padding: 2rem;">ID: ${doc.id}</small>
                    </div>
                `;


            
                requestsContainer.appendChild(card);
            }
        }
    } catch (error) {
        console.error("İstekleri çekerken bir hata oluştu:", error);
        requestsContainer.innerHTML = `<p>Bir hata oluştu, lütfen daha sonra tekrar deneyin.</p>`;
    }

});
//<div></div>
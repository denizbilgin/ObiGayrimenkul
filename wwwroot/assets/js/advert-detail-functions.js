import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


const getAdvertById = async (db, collectionName, id) => {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("Belge bulunamadı.");
            return null;
        }
    } catch (error) {
        console.error("Belge alınırken hata oluştu:", error);
        throw error;
    }
};

const getPlaceNameById = async (db, place_id) => {
    try {
        const docRef = doc(db, 'district_and_quarters', String(place_id));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.sehir_ilce_mahalle_adi;
        } else {
            console.log(`${place_id} IDsine sahip belge bulunamadı.`);
            return null;
        }
    } catch (error) {
        console.error("Hata oluştu: ", error);
        return null;
    }
};

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

    const booleanFields = [
        { key: "has_lift", label: "ASANSÖR" },
        { key: "have_cellar", label: "KİLER" },
        { key: "is_close_health_center", label: "SAĞLIK OCAĞINA YAKIN" },
        { key: "is_close_school", label: "OKULA YAKIN" },
        { key: "is_furnished", label: "EŞYALI" },
        { key: "is_in_site", label: "SİTE İÇERİSİNDE" },
        { key: "parking", label: "OTOPARK" }
    ];

    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const path = window.location.pathname;
        const advertId = path.split('/').pop();
        
        const data = await getAdvertById(db, "adverts", advertId);

        if (data) {
            console.log(data);
            document.getElementsByTagName("h1")[0].innerHTML = data.title;
            document.getElementsByTagName("h1")[1].innerHTML = data.title;
            const districtName = await getPlaceNameById(db, data.address_district_id);
            const quarterName = await getPlaceNameById(db, data.address_quarter_id);
            document.getElementById("advert-district-location").innerHTML = districtName;
            document.getElementById("advert-quarter-location").innerHTML = quarterName;
            document.getElementById("advert-price").innerHTML = data.price + " TL";
            document.getElementById("advert-description").innerHTML = data.description;
            document.getElementById("advert-status-value").innerHTML = data.status;
            document.getElementById("advert-gross-m2-value").innerHTML = data.square_meter_gross + `<b class="property-info-unit"> m²</b>`;
            document.getElementById("advert-net-m2-value").innerHTML = data.square_meter_net + `<b class="property-info-unit"> m²</b>`;
            document.getElementById("room-number-value").innerHTML = data.room_number;
            document.getElementById("advert-building-age-value").innerHTML = data.building_age;
            document.getElementById("advert-which-floor-value").innerHTML = data.which_floor;
            document.getElementById("advert-building-floor-number-value").innerHTML = data.building_floor_number;
            document.getElementById("advert-balcony-count-value").innerHTML = data.balcony_count;
            document.getElementById("advert-dues-value").innerHTML = "Aidat: " + data.dues + " TL";
            
            

            const detailsList = document.querySelector(".additional-details-list");
            booleanFields.forEach(field => {
                const listItem = document.createElement("li");
                const titleSpan = document.createElement("span");
                titleSpan.className = "col-xs-6 col-sm-4 col-md-4 add-d-title";
                titleSpan.textContent = field.label;
                const valueSpan = document.createElement("span");
                valueSpan.className = "col-xs-6 col-sm-8 col-md-8 add-d-entry";
                valueSpan.textContent = data[field.key] ? "Evet" : "Hayır";
                
                listItem.appendChild(titleSpan);
                listItem.appendChild(valueSpan);

                detailsList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Firebase başlatma hatası:", error);
    }
});
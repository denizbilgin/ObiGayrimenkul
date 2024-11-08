import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


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

const getImagesAndPopulateSlider = async (storage, imagePaths) => {
    const gallery = document.getElementById("lightSlider");
    let imagesLoaded = 0;

    for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        const storageRef = ref(storage, imagePath);

        try {
            const url = await getDownloadURL(storageRef);
            const li = document.createElement("li");
            li.setAttribute("data-thumb", url);
            li.style.width = "720px";

            const img = document.createElement("img");
            img.setAttribute("src", url);

            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === imagePaths.length) {
                    document.getElementById("preloader").style.display = "none";
                    $("#lightSlider").lightSlider({
                        gallery: true,
                        item: 1,
                        loop: true,
                        thumbItem: 9,
                        slideMargin: 0,
                        enableDrag: true,
                        currentPagerPosition: 'left',
                    });
                }
            };

            li.appendChild(img);
            gallery.appendChild(li);
        } catch (error) {
            console.error("Resmi alırken hata:", error);
        }
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

    const extraDetails = [
        { key: "has_lift", label: "ASANSÖR", type:"boolean" },
        { key: "have_cellar", label: "KİLER", type:"boolean" },
        { key: "is_close_health_center", label: "SAĞLIK OCAĞINA YAKIN", type:"boolean" },
        { key: "is_close_school", label: "OKULA YAKIN", type:"boolean" },
        { key: "is_furnished", label: "EŞYALI", type:"boolean" },
        { key: "is_in_site", label: "SİTE İÇERİSİNDE", type:"boolean" },
        { key: "parking", label: "OTOPARK", type:"boolean" },
        { key: "dues", label: "AİDAT", type:"string"},
        { key: "heating", label: "ISITMA", type:"string"}
    ];

    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);

        const path = window.location.pathname;
        const advertId = path.split('/').pop();
        
        const data = await getAdvertById(db, "adverts", advertId);

        if (data) {
            getImagesAndPopulateSlider(storage, data.images);
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
            document.getElementById("advert-number-of-bathrooms-value").innerHTML = data.number_of_bathrooms + " Adet Banyo";
            document.getElementById("advert-side-value").innerHTML = data.side + " Cephe";
            
            
            

            const detailsList = document.querySelector(".additional-details-list");
            extraDetails.forEach(field => {
                const listItem = document.createElement("li");
                const titleSpan = document.createElement("span");
                titleSpan.className = "col-xs-6 col-sm-4 col-md-4 add-d-title";
                titleSpan.textContent = field.label;
                const valueSpan = document.createElement("span");
                valueSpan.className = "col-xs-6 col-sm-8 col-md-8 add-d-entry";
                if (field.type === "boolean") {
                    valueSpan.textContent = data[field.key] ? "Evet" : "Hayır";
                } else {
                    valueSpan.textContent = data[field.key] || "";
                }
                
                listItem.appendChild(titleSpan);
                listItem.appendChild(valueSpan);

                detailsList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Firebase başlatma hatası:", error);
    }
});
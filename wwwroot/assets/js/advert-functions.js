import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const getPlaceNameById = async (db, place_id) => {
    try {
        const docRef = doc(db, 'district_and_quarters', String(place_id));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return capitalize(data.sehir_ilce_mahalle_adi);
        } else {
            console.log(`${place_id} IDsine sahip belge bulunamadı.`);
            return null;
        }
    } catch (error) {
        console.error("Hata oluştu: ", error);
        return null;
    }
};

const getThumbnailUrl = async (storage, imagePath) => {
    try {
        const advertThumbnailRef = ref(storage, imagePath);
        const advertThumbnailUrl = await getDownloadURL(advertThumbnailRef);
        return advertThumbnailUrl;
    } catch (error) {
        const defaultThumbnailUrl = 'default_advert_thumbnail.webp';
        const advertThumbnailRef = ref(storage, defaultThumbnailUrl);
        const defaultImageUrl = await getDownloadURL(advertThumbnailRef);
        return defaultImageUrl;
    }
};

const capitalize = (str) => {
    if (typeof str !== 'string') return '';
    str = str.toLowerCase()
    return str.charAt(0).toUpperCase() + str.slice(1);
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


document.addEventListener("DOMContentLoaded", async function () {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);
    const storage = getStorage(app);

    const response = await fetch("/adverts/all-adverts");
    const adverts = await response.json();

    const advertsContainer = document.getElementById("list-type");
    for (const advert of adverts) {        
        const placeName = await getPlaceNameById(db, advert.addressDistrictID);
        const thumbnailUrl = await getThumbnailUrl(storage, advert.advertImages[0]);
        
        const advertCardHtml = `
            <div class="col-sm-6 col-md-3 p0">
                <div class="box-two proerty-item">
                    <div class="item-thumb">
                        <a href="adverts/${advert.id}"><img src="${thumbnailUrl}"></a>
                    </div>
                    <div class="item-entry overflow">
                        <h5><a href="adverts/${advert.id}">${advert.advertTitle}</a></h5>
                        <div class="dot-hr"></div>
                        <span class="pull-left"><b> Alan :</b> ${advert.squareMeterGross} m²</span>
                        <span class="proerty-price pull-right"> $ ${advert.price}</span>
                        <div class="property-icon">
                            <img src="assets/img/icon/district.png"><p style="margin-right: 1rem; display: inline;" margin-left: 6px;> ${placeName}</p>
                            <img src="assets/img/icon/room.png"> ${advert.roomNumber}
                        </div>
                    </div>
                </div>
            </div>`;
        advertsContainer.innerHTML += advertCardHtml;
    }
});

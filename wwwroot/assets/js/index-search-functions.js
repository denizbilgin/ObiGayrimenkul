import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

function getStatusValue() {
    let data = Number(document.querySelector('.statusPicker select').value);
    if (data === 1) {
        return true;
    } else if(data === 2) {
        return false;
    } else {
        return null;
    }
}

<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("index-search-btn").setAttribute("type", "button");
    document.getElementById("index-search-btn").addEventListener("click", (event) => {
        event.preventDefault();
        var searchData = {
            selectedDistrictId : Number(document.querySelector('.districtPicker select').value) === 0 ? null: Number(document.querySelector('.districtPicker select').value),
            selectedQuartertId : Number(document.querySelector('.quarterPicker select').value) === 0 ? null: Number(document.querySelector('.quarterPicker select').value),
            selectedStatus : getStatusValue(),
            isHasLiftChecked : document.getElementById("index-search-has-lift").checked === true ? true: null,
            isHasCellarChecked : document.getElementById("index-search-has-cellar").checked === true ? true: null,
            isIsCloseSchoolChecked : document.getElementById("index-search-is-close-school").checked === true ? true: null,
            isIsCloseHealthCenterChecked : document.getElementById("index-search-is-close-health-center").checked === true ? true: null,
            isIsFurnishedChecked : document.getElementById("index-search-is-furnished").checked === true ? true: null,
            isIsInSiteChecked : document.getElementById("index-search-is-in-site").checked === true ? true: null,
            isHasParkChecked : document.getElementById("index-search-has-park").checked === true ? true: null,
            minPrice : document.getElementById("index-min-price").value,
            maxPrice : document.getElementById("index-max-price").value === 0 ? null: document.getElementById("index-max-price").value,
            minSquaremeter : document.getElementById("index-min-squaremeter").value,
            maxSquaremeter : document.getElementById("index-max-squaremeter").value === 0 ? null: document.getElementById("index-max-squaremeter").value,
=======
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
>>>>>>> 50fe96984be8ed75b1a561d94cb22060f3c3ea85
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

const toggleActiveClass = (clickedButton, otherButton) => {
    const clickedParent = clickedButton.parentElement;
    const otherParent = otherButton.parentElement;

    if (!clickedParent.classList.contains("active")) {
        clickedParent.classList.add("active");
    }

    if (otherParent.classList.contains("active")) {
        otherParent.classList.remove("active");
    }
};

const parseFirebaseDate = (firebaseDateString) => {
    const cleanedDateString = firebaseDateString.replace(" at", "").replace(" UTC+3", "");
    
    const result = new Date(cleanedDateString);
    return result;
};

document.addEventListener("DOMContentLoaded", async function () {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);
    const storage = getStorage(app);
    

});
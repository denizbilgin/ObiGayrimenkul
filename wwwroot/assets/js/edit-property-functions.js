import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, query, where, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const getAdvertById = async (id) => {
    const url = `/adverts/get-details/${id}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const advertData = await response.json();
            return advertData;
        } else {
            console.log("İlan bulunamadı");
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

const loadDistricts = async (db, districtElement) => {
    const q = query(collection(db, 'district_and_quarters'), where('ust_id', '==', 27));
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        const data = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = data.sehir_ilce_mahalle_adi;
        districtElement.appendChild(option);
    });

    // Restarting bootstrap select
    $('.selectpicker').selectpicker('refresh');
};

const loadQuarters = async (db, districtId, quarterElement) => {
    const q = query(collection(db, 'district_and_quarters'), where('ust_id', '==', districtId));
    const snapshot = await getDocs(q);

    quarterElement.innerHTML = '<option class="bs-title-option" value="">Mahalle</option>';

    snapshot.forEach((doc) => {
        const data = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = data.sehir_ilce_mahalle_adi;
        quarterElement.appendChild(option);
    });

    // Restarting bootstrap select
    $('.selectpicker').selectpicker('refresh');
};

function determineCheckboxStatus(elementId, value) {
    document.getElementById(elementId).checked = value;
    if (value === true) {
        document.getElementById(elementId).parentElement.classList.add("checked");
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const app = await getFirebaseConfigurations();
        const db = getFirestore(app);
        const storage = getStorage(app);

        const path = window.location.pathname;
        const advertId = path.split('/').pop();
        const advert = await getAdvertById(advertId);

        if (advert) {
            console.log(advert);

            // Step 1
            document.getElementById("advert-title").value = advert.advertTitle;
            document.getElementById("advert-price").value = advert.price;
            document.getElementById("advert-address").value = advert.address;
            document.getElementById("advert-building-age").value = advert.buildingAge;
            document.getElementById("advert-building-floors").value = advert.buildingFloors;
            document.getElementById("advert-number-of-floors").value = advert.numberOfFloors;
            document.getElementById("advert-dues").value = advert.dues;
            document.getElementById("advert-balcony-count").value = advert.balconyCount;
            document.getElementById("advert-which-floor").value = advert.whichFloor;
            const sideSelectEditProp = document.querySelector('.sidePicker select');
            const heatingSelectEditProp = document.querySelector('.heatingPicker select');
            Array.from(sideSelectEditProp.options).forEach(option => {
                option.selected = option.value === String(advert.side);
            });
            Array.from(heatingSelectEditProp.options).forEach(option => {
                option.selected = option.value === String(advert.heating);
            });

            // Step 2
            document.getElementById("advert-description").value = advert.description;
            const districtSelectEditProp = document.querySelector('.districtPicker select');
            const quarterSelectEditProp = document.querySelector('.quarterPicker select');
            const statusSelectEditProp = document.querySelector('.statusPicker select');
            await loadDistricts(db, districtSelectEditProp);
            Array.from(districtSelectEditProp.options).forEach(option => {
                option.selected = option.value === String(advert.addressDistrictID);
            });
            await loadQuarters(db, advert.addressDistrictID, quarterSelectEditProp);
            Array.from(quarterSelectEditProp.options).forEach(option => {
                option.selected = option.value === String(advert.addressQuarterID);
            });
            Array.from(statusSelectEditProp.options).forEach(option => {
                option.selected = option.value === String(advert.status === true ? 1: 0);
            });
            document.getElementById("advert-square-meter-gross").value = advert.squareMeterGross;
            document.getElementById("advert-square-meter-net").value = advert.squareMeterNet;
            document.getElementById("advert-room-number").value = advert.roomNumber;
            document.getElementById("advert-number-of-bathrooms").value = advert.numberOfBathrooms;
            determineCheckboxStatus("advert-has-garage", advert.hasGarage);
            determineCheckboxStatus("advert-is-furnished", advert.isFurnished);
            determineCheckboxStatus("advert-has-lift", advert.hasLift);
            determineCheckboxStatus("advert-have-cellar", advert.haveCellar);
            determineCheckboxStatus("advert-is-close-health-center", advert.isCloseToHealthCenter);
            determineCheckboxStatus("advert-is-close-school", advert.isCloseToSchool);
            determineCheckboxStatus("advert-is-in-site", advert.isInSite);
            determineCheckboxStatus("advert-is-earthquake-resistant", advert.isEarthquakeResistant);
            


            $('.sidePicker').selectpicker('refresh');
            $('.heatingPicker').selectpicker('refresh');
            $('.districtPicker').selectpicker('refresh');
            $('.quarterPicker').selectpicker('refresh');
            $('.statusPicker').selectpicker('refresh');
        }
});
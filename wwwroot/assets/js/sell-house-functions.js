import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
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

document.addEventListener("DOMContentLoaded", async function() {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);

    const newAdvertData = {
        Id: "",
        Name: "",
        PhoneNumber: "",
        Price: 0,
        BuildingAge: 0,
        Dues: 0,
        HeatingType: 0,
        WhichFloor: 0,
        NumberOfRooms: "",
        SquareMeter: "",
        NumberOfBalcony: 0,
        IsFurnished: false,
        Status: false,
        DistrictId: 0,
        QuarterId: 0,
        OtherInformations: ""
    };

    // Selects
    const districtSelectSubmitProp = document.querySelector('.districtPicker');
    const quarterSelectSubmitProp = document.querySelector('.quarterPicker');
    const heatingSelectSubmitProp = document.querySelector('.heatingPicker');
    await loadDistricts(db, districtSelectSubmitProp);
    districtSelectSubmitProp.addEventListener('change', async (event) => {
        newAdvertData.DistrictId = Number(event.target.value);
        await loadQuarters(db, newAdvertData.DistrictId, quarterSelectSubmitProp);
    });
    quarterSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.QuarterId = Number(event.target.value);
    });
    heatingSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.HeatingType = Number(event.target.value);
    });

    // Inputs
    document.getElementById("advert-name").addEventListener('input', (event) => {
        newAdvertData.Name = event.target.value;
    });
    document.getElementById("advert-phone-number").addEventListener('input', (event) => {
        newAdvertData.PhoneNumber = event.target.value;
    });
    document.getElementById("advert-price").addEventListener('input', (event) => {
        newAdvertData.Price = Number(event.target.value);
    });
    document.getElementById("advert-building-age").addEventListener('input', (event) => {
        newAdvertData.BuildingAge = Number(event.target.value);
    });
    document.getElementById("advert-dues").addEventListener('input', (event) => {
        newAdvertData.Dues = Number(event.target.value);
    });
    document.getElementById("advert-which-floor").addEventListener('input', (event) => {
        newAdvertData.WhichFloor = Number(event.target.value);
    });
    document.getElementById("advert-room-number").addEventListener('input', (event) => {
        newAdvertData.NumberOfRooms = event.target.value;
    });
    document.getElementById("advert-square-meter").addEventListener('input', (event) => {
        newAdvertData.SquareMeter = Number(event.target.value);
    });
    document.getElementById("advert-balcony-count").addEventListener('input', (event) => {
        newAdvertData.NumberOfBalcony = Number(event.target.value);
    });
    document.getElementById("advert-is-furnished").addEventListener('input', (event) => {
        newAdvertData.IsFurnished = event.target.value;
    });
    document.getElementById("advert-sell-or-rent").addEventListener('input', (event) => {
        newAdvertData.Status = event.target.value;
    });
    document.getElementById("advert-other-information").addEventListener('input', (event) => {
        newAdvertData.OtherInformations = event.target.value;
    });
});
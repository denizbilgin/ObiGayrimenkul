import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
        console.log(data.sehir_ilce_mahalle_adi);
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = data.sehir_ilce_mahalle_adi;
        quarterElement.appendChild(option);
    });

    // Restarting bootstrap select
    $('.selectpicker').selectpicker('refresh');
};

document.addEventListener('DOMContentLoaded', async () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const districtSelectHome = document.querySelector('.districtPicker');
    const quarterSelectHome = document.querySelector('.quarterPicker');
    
    await loadDistricts(db, districtSelectHome);
    districtSelectHome.addEventListener('change', async (event) => {
        const selectedDistrictId = Number(event.target.value);
        await loadQuarters(db, selectedDistrictId, quarterSelectHome);
    });
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', async () => {
    
    const waitForElement = (selector) => {
        return new Promise((resolve) => {
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            checkElement();
        });
    };
    const districtSelectHome = await waitForElement('.districtPicker select');
    const quarterSelectHome = await waitForElement('.quarterPicker select');

    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);
    
    await loadDistricts(db, districtSelectHome);
    districtSelectHome.addEventListener('change', async (event) => {
        const selectedDistrictId = Number(event.target.value);
        await loadQuarters(db, selectedDistrictId, quarterSelectHome);
    });
});
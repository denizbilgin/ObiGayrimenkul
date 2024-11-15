import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, query, where, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

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

const getAdvertPhotoFromStorage = async (app, imageName) => {
    const storage = getStorage(app);

    const advertImageRef = ref(storage, imageName);
    try {
        const imageUrl = await getDownloadURL(advertImageRef);
        return imageUrl;
    } catch (error) {
        console.log("Hata:", error);
    }
};

const getAdvertImages = async (app, advert) => {
    const imagesContainer = document.getElementById('imagesContainer');

    if (advert.advertImages.length > 0) {
        for (const imageName of advert.advertImages) {
            const imageCard = document.createElement('div');
            imageCard.classList.add('image-card');

            const img = document.createElement('img');
            img.src = await getAdvertPhotoFromStorage(app, imageName);
            img.alt = `Image: ${imageName}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Sil';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', async (event) => {
                event.preventDefault();
                await deleteImage(app, imageName, advert);
                imageCard.remove();
            });

            imageCard.appendChild(img);
            imageCard.appendChild(deleteButton);
            imagesContainer.appendChild(imageCard);
        }
    }
}

async function deleteImage(app, imageName, advert) {
    try {
        const storage = getStorage(app);
        const db = getFirestore(app);

        const imageRef = ref(storage, imageName);
        await deleteObject(imageRef);

        const updatedImages = advert.advertImages.filter(name => name !== imageName);
        const advertRef = doc(db, 'adverts', advert.id);
        await updateDoc(advertRef, { images: updatedImages });

        console.log(`${imageName} başarıyla silindi.`);
    } catch (error) {
        console.error(`Resim silinirken hata oluştu: ${error}`);
    }
}

function determineCheckboxStatus(elementId, value) {
    document.getElementById(elementId).checked = value;
    if (value === true) {
        document.getElementById(elementId).parentElement.classList.add("checked");
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);

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
            $('.sidePicker').selectpicker('refresh');
            $('.heatingPicker').selectpicker('refresh');

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
            $('.districtPicker').selectpicker('refresh');
            $('.quarterPicker').selectpicker('refresh');
            $('.statusPicker').selectpicker('refresh');

            // Step 3
            document.getElementById("advert-video").value = advert.video;
            await getAdvertImages(app, advert);
        }
});
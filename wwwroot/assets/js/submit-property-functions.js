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
        advertTitle: '',                   //
        approved: false,                   //
        price: 0,                          //
        publishDate: Date.now(),           //
        description: '',                   //
        address: '',                       //
        squareMeterGross: 0,               //
        squareMeterNet: 0,                 //
        roomNumber: '',                    //
        buildingAge: 0,                    //
        numberOfBathrooms: 0,              //
        numberOfFloors: 0,                 //
        hasGarage: false,                  //
        isFurnished: false,                //
        hasLift: false,                    //
        haveCellar: false,                 //
        isCloseToHealthCenter: false,      //
        isCloseToSchool: false,            //
        isInSite: false,                   //
        isEarthquakeResistant: false,      //
        heating: 0,                        //
        dues: 0,                           //
        addressDistrictID: null,           //
        addressQuarterID: null,            //
        side: 0,                           //
        whichFloor: 0,                     //
        video: "",
        advertImages: [],
        balconyCount: 0,                   //
        documentPath: "",
        status: false,                     //
        userID: "",
        buildingFloors: 0,                 //
    };


    // Selects
    const districtSelectSubmitProp = document.querySelector('.districtPicker');
    const quarterSelectSubmitProp = document.querySelector('.quarterPicker');
    const statusSelectSubmitProp = document.querySelector('.statusPicker');
    const heatingSelectSubmitProp = document.querySelector('.heatingPicker');
    const sideSelectSubmitProp = document.querySelector('.sidePicker');
    await loadDistricts(db, districtSelectSubmitProp);
    districtSelectSubmitProp.addEventListener('change', async (event) => {
        newAdvertData.addressDistrictID = Number(event.target.value);
        await loadQuarters(db, newAdvertData.addressDistrictID, quarterSelectSubmitProp);
    });
    quarterSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.addressQuarterID = Number(event.target.value);
    });
    statusSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.status = Number(event.target.value) === 1;
    });
    heatingSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.heating = Number(event.target.value);
    });
    sideSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.side = Number(event.target.value);
    });


    // Inputs
    document.getElementById("advert-title").addEventListener('input', (event) => {
        newAdvertData.advertTitle = event.target.value;
    });
    document.getElementById("advert-price").addEventListener('input', (event) => {
        newAdvertData.price = Number(event.target.value);
    });
    document.getElementById("advert-address").addEventListener('input', (event) => {
        newAdvertData.address = event.target.value;
    });
    document.getElementById("advert-description").addEventListener('input', (event) => {
        newAdvertData.description = event.target.value;
    });
    document.getElementById("advert-square-meter-gross").addEventListener('input', (event) => {
        newAdvertData.squareMeterGross = Number(event.target.value);
    });
    document.getElementById("advert-square-meter-net").addEventListener('input', (event) => {
        newAdvertData.squareMeterNet = Number(event.target.value);
    });
    document.getElementById("advert-room-number").addEventListener('input', (event) => {
        newAdvertData.roomNumber = event.target.value;
    });
    document.getElementById("advert-number-of-bathrooms").addEventListener('input', (event) => {
        newAdvertData.numberOfBathrooms = Number(event.target.value);
    });
    document.getElementById("advert-building-age").addEventListener('input', (event) => {
        newAdvertData.buildingAge = Number(event.target.value);
    });
    document.getElementById("advert-building-floors").addEventListener('input', (event) => {
        newAdvertData.buildingFloors = Number(event.target.value);
    });
    document.getElementById("advert-dues").addEventListener('input', (event) => {
        newAdvertData.dues = Number(event.target.value);
    });
    document.getElementById("advert-which-floor").addEventListener('input', (event) => {
        newAdvertData.whichFloor = Number(event.target.value);
    });
    document.getElementById("advert-balcony-count").addEventListener('input', (event) => {
        newAdvertData.balconyCount = Number(event.target.value);
    });
    document.getElementById("advert-number-of-floors").addEventListener('input', (event) => {
        newAdvertData.numberOfFloors = Number(event.target.value);
    });

    // Checkboxes
    document.getElementById("advert-has-garage").addEventListener('change', (event) => {
        newAdvertData.hasGarage = event.target.checked;
    });
    document.getElementById("advert-is-furnished").addEventListener('change', (event) => {
        newAdvertData.isFurnished = event.target.checked;
    });
    document.getElementById("advert-has-lift").addEventListener('change', (event) => {
        newAdvertData.hasLift = event.target.checked;
    });
    document.getElementById("advert-have-cellar").addEventListener('change', (event) => {
        newAdvertData.haveCellar = event.target.checked;
    });
    document.getElementById("advert-is-close_health_center").addEventListener('change', (event) => {
        newAdvertData.isCloseToHealthCenter = event.target.checked;
    });
    document.getElementById("advert-is-close_school").addEventListener('change', (event) => {
        newAdvertData.isCloseToSchool = event.target.checked;
    });
    document.getElementById("advert-is-in-site").addEventListener('change', (event) => {
        newAdvertData.isInSite = event.target.checked;
    });
    document.getElementById("advert-is-earthquake-resistant").addEventListener('change', (event) => {
        newAdvertData.isEarthquakeResistant = event.target.checked;
    });

    // File Selects
    document.getElementById("property-images").addEventListener("change", async function(event) {
        const files = event.target.files;
        if (files.length > 0) {
            const storage = getStorage(app);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const extension = file.name.split('.').pop();
                const filenameToUpload = `${newAdvertData.advertTitle.replaceAll(" ", "-")}-${i}-${new Date().getTime()}.${extension}`;
                const storageRef = ref(storage, filenameToUpload);
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on("state_changed",
                    (snapshot) => {
                        // Yükleme ilerleme durumu burada ele alınabilir
                        // Örneğin: progress bar eklemek
                        console.log(filenameToUpload, " adlı dosya firebase'e yüklendi.");
                    },
                    (error) => {
                        // Hata durumunda yapılacaklar
                        console.error("Yükleme hatası:", error);
                    },
                    async () => {
                        //const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        //document.getElementById("user-picture").setAttribute("src", downloadURL);
                        //document.getElementById("user-picture").setAttribute("user-filename", fileName);
                        //await updateUser();
                    }
                )
            }

            
        }
    });
    
});
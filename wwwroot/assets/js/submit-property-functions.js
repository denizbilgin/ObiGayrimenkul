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

async function resizeImage(file, width, height) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Resmi yeniden boyutlandırma başarısız."));
                }
            }, file.type);
        };

        img.onerror = (error) => reject(error);
        img.src = URL.createObjectURL(file);
    });
};

function convertToEmbed(rawLink) {
    const videoId = rawLink.split("v=")[1]?.split("&")[0];
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return rawLink;
}

document.addEventListener("DOMContentLoaded", async function() {
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
    const districtSelectSubmitProp = await waitForElement('.districtPicker select');
    const quarterSelectSubmitProp = await waitForElement('.quarterPicker select');

    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);

    const newAdvertData = {
        Id: "",
        AdvertTitle: '',                   
        Price: 0,                          
        Description: '',                   
        Address: '',                       
        SquareMeterGross: 0,               
        SquareMeterNet: 0,                 
        RoomNumber: '',                    
        BuildingAge: 0,                    
        NumberOfBathrooms: 0,              
        NumberOfFloors: 0,                 
        HasGarage: false,                  
        IsFurnished: false,                
        HasLift: false,                    
        HaveCellar: false,                 
        IsCloseToHealthCenter: false,      
        IsCloseToSchool: false,            
        IsInSite: false,                   
        IsEarthquakeResistant: false,      
        Heating: 0,                        
        Dues: 0,                           
        AddressDistrictID: null,           
        AddressQuarterID: null,            
        Side: 0,                           
        WhichFloor: 0,                     
        Video: "",                         
        AdvertImages: [],                  
        BalconyCount: 0,                   
        DocumentPath: "",                  
        Status: false,                     
        UserID: localStorage.getItem("userId"),
        BuildingFloors: 0,                 
        Approved: false,
        PublishDate: ""
    };


    // Selects
    const statusSelectSubmitProp = document.querySelector('.statusPicker select');
    const heatingSelectSubmitProp = document.querySelector('.heatingPicker select');
    const sideSelectSubmitProp = document.querySelector('.sidePicker select');
    await loadDistricts(db, districtSelectSubmitProp);
    districtSelectSubmitProp.addEventListener('change', async (event) => {
        newAdvertData.AddressDistrictID = Number(event.target.value);
        await loadQuarters(db, newAdvertData.AddressDistrictID, quarterSelectSubmitProp);
    });
    quarterSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.AddressQuarterID = Number(event.target.value);
    });
    statusSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.Status = Number(event.target.value) === 1;
    });
    heatingSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.Heating = Number(event.target.value);
    });
    sideSelectSubmitProp.addEventListener('change', (event) => {
        newAdvertData.Side = Number(event.target.value);
    });


    // Inputs
    document.getElementById("advert-title").addEventListener('input', (event) => {
        newAdvertData.AdvertTitle = event.target.value;
    });
    document.getElementById("advert-price").addEventListener('input', (event) => {
        newAdvertData.Price = Number(event.target.value);
    });
    document.getElementById("advert-address").addEventListener('input', (event) => {
        newAdvertData.Address = event.target.value;
    });
    document.getElementById("advert-description").addEventListener('input', (event) => {
        newAdvertData.Description = event.target.value;
    });
    document.getElementById("advert-square-meter-gross").addEventListener('input', (event) => {
        newAdvertData.SquareMeterGross = Number(event.target.value);
    });
    document.getElementById("advert-square-meter-net").addEventListener('input', (event) => {
        newAdvertData.SquareMeterNet = Number(event.target.value);
    });
    document.getElementById("advert-room-number").addEventListener('input', (event) => {
        newAdvertData.RoomNumber = event.target.value;
    });
    document.getElementById("advert-number-of-bathrooms").addEventListener('input', (event) => {
        newAdvertData.NumberOfBathrooms = Number(event.target.value);
    });
    document.getElementById("advert-building-age").addEventListener('input', (event) => {
        newAdvertData.BuildingAge = Number(event.target.value);
    });
    document.getElementById("advert-building-floors").addEventListener('input', (event) => {
        newAdvertData.BuildingFloors = Number(event.target.value);
    });
    document.getElementById("advert-dues").addEventListener('input', (event) => {
        newAdvertData.Dues = Number(event.target.value);
    });
    document.getElementById("advert-which-floor").addEventListener('input', (event) => {
        newAdvertData.WhichFloor = Number(event.target.value);
    });
    document.getElementById("advert-balcony-count").addEventListener('input', (event) => {
        newAdvertData.BalconyCount = Number(event.target.value);
    });
    document.getElementById("advert-number-of-floors").addEventListener('input', (event) => {
        newAdvertData.NumberOfFloors = Number(event.target.value);
    });
    document.getElementById("advert-video").addEventListener('input', (event) => {
        newAdvertData.Video = convertToEmbed(event.target.value);
    });

    // Checkboxes
    document.getElementById("advert-has-garage").addEventListener('change', (event) => {
        newAdvertData.HasGarage = event.target.checked;
    });
    document.getElementById("advert-is-furnished").addEventListener('change', (event) => {
        newAdvertData.IsFurnished = event.target.checked;
    });
    document.getElementById("advert-has-lift").addEventListener('change', (event) => {
        newAdvertData.HasLift = event.target.checked;
    });
    document.getElementById("advert-have-cellar").addEventListener('change', (event) => {
        newAdvertData.HaveCellar = event.target.checked;
    });
    document.getElementById("advert-is-close_health_center").addEventListener('change', (event) => {
        newAdvertData.IsCloseToHealthCenter = event.target.checked;
    });
    document.getElementById("advert-is-close_school").addEventListener('change', (event) => {
        newAdvertData.IsCloseToSchool = event.target.checked;
    });
    document.getElementById("advert-is-in-site").addEventListener('change', (event) => {
        newAdvertData.IsInSite = event.target.checked;
    });
    document.getElementById("advert-is-earthquake-resistant").addEventListener('change', (event) => {
        newAdvertData.IsEarthquakeResistant = event.target.checked;
    });

    // File Selects
    document.getElementById("property-images").addEventListener("change", async function(event) {
        const files = event.target.files;
        console.log(files);
        if (files.length > 0) {
            const storage = getStorage(app);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const extension = file.name.split('.').pop();
                const filenameToUpload = `${newAdvertData.AdvertTitle.replaceAll(" ", "-")}-${i}-${new Date().getTime()}.${extension}`;
                const storageRef = ref(storage, filenameToUpload);
                const resizedBlob = await resizeImage(file, 850, 570);
                const uploadTask = uploadBytesResumable(storageRef, resizedBlob);

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
                        newAdvertData.AdvertImages.push(filenameToUpload);   
                        //const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        //document.getElementById("user-picture").setAttribute("src", downloadURL);
                        //document.getElementById("user-picture").setAttribute("user-filename", fileName);
                        //await updateUser();
                    }
                )
            }
        }
    });
    document.getElementById("advert-document").addEventListener("change", async function(event) {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            const storage = getStorage(app);
            const filenameToUpload = `advert_documents/${newAdvertData.AdvertTitle.replaceAll(" ", "-")}-${new Date().getTime()}.pdf`;
            const storageRef = ref(storage, filenameToUpload);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on("state_changed",
                (snapshot) => {
                    // Yükleme ilerleme durumu burada ele alınabilir
                    console.log(filenameToUpload, " adlı PDF firebase'e yüklendi.");
                    newAdvertData.DocumentPath = filenameToUpload;
                },
                (error) => {
                    // Hata durumunda yapılacaklar
                    console.error("PDF yükleme hatası:", error);
                },
                async () => {
                    // Yükleme tamamlandığında yapılacak işlemler
                    // const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    // console.log("PDF Dosya URL:", downloadURL);
                }
            );
        } else {
            console.error("Lütfen bir PDF dosyası seçin.");
        }
    });


    document.getElementById("advert-submit-button").addEventListener("click", async function() {
        try {
            const response = await fetch("/adverts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newAdvertData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log("İlan başarıyla eklendi:", data);
                window.location.href = `/home`;
            } else {
                const errorData = await response.json();
                console.error("İlan eklenirken hata oluştu:", errorData);
            }
        } catch (error) {
            console.error("Veri gönderilirken bir hata oluştu:", error);
        }
    });
    
});
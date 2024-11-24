import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, query, where, collection, getDocs, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL, deleteObject, uploadBytesResumable, uploadBytes } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

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

const getDocumentFromStorage = async (app, documentName) => {
    const storage = getStorage(app);

    const advertDocumentRef = ref(storage, documentName);
    try {
        const documentUrl = await getDownloadURL(advertDocumentRef);
        return documentUrl;
    } catch (error) {
        console.log("Hata:", error);
    }
};

const getAdvertImages = async (app, advert) => {
    const imagesContainer = document.getElementById('imagesContainer');
    imagesContainer.innerHTML = "";

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
}

async function uploadPDF(app, advert) {
    const fileInput = document.getElementById('advert-document');

    const file = fileInput.files[0];
    if (file.type !== "application/pdf") {
        console.log("Sadece PDF dosyaları yüklenebilir.");
        return;
    }

    try { 
        const storage = getStorage(app);
        const filenameToUpload = `advert_documents/${advert.advertTitle.replaceAll(" ", "-")}-${new Date().getTime()}.pdf`;
        const storageRef = ref(storage, filenameToUpload);

        await uploadBytes(storageRef, file);

        if (advert.documentPath) {
            const oldFileRef = ref(storage, advert.documentPath);
            await deleteObject(oldFileRef);
        }

        advert.documentPath = filenameToUpload;
    } catch (error) {
        console.error("Dosya yüklenirken bir hata oluştu:", error);
    }
}

function convertToEmbed(rawLink) {
    const videoId = rawLink.split("v=")[1]?.split("&")[0];
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return rawLink;
}

document.addEventListener("DOMContentLoaded", async function () {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);

    const path = window.location.pathname;
    const advertId = path.split('/').pop();
    const advert = await getAdvertById(advertId);

        if (advert) {

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
            document.getElementById("advert-property-owner-phone").value = advert.ownerPhone;
            document.getElementById("advert-property-island-number").value = advert.islandNumber;
            document.getElementById("advert-property-parcel-number").value = advert.parcelNumber;
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
            districtSelectEditProp.addEventListener('change', async (event) => {
                advert.addressDistrictID = Number(event.target.value);
                await loadQuarters(db, advert.addressDistrictID, quarterSelectEditProp);
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
            $('.districtPicker').selectpicker('refresh');
            $('.quarterPicker').selectpicker('refresh');
            $('.statusPicker').selectpicker('refresh');

            // Step 3
            document.getElementById("advert-video").value = advert.video;
            await getAdvertImages(app, advert);
            document.getElementById("property-images").addEventListener("change", async function(event) {
                const files = event.target.files;
                if (files.length > 0) {
                    const storage = getStorage(app);
        
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const extension = file.name.split('.').pop();
                        const filenameToUpload = `${document.getElementById("advert-title").value.replaceAll(" ", "-")}-${i}-${new Date().getTime()}.${extension}`;
                        const storageRef = ref(storage, filenameToUpload);
                        const resizedBlob = await resizeImage(file, 850, 570);
                        const uploadTask = uploadBytesResumable(storageRef, resizedBlob);
        
                        uploadTask.on("state_changed",
                            (snapshot) => {
                                // Yükleme ilerleme durumu burada ele alınabilir
                                // Örneğin: progress bar eklemek
                            },
                            (error) => {
                                // Hata durumunda yapılacaklar
                                console.error("Yükleme hatası:", error);
                            },
                            async () => {     
                                const advertRef = doc(db, 'adverts', advert.id);
                                advert.advertImages.push(filenameToUpload);
                                await updateDoc(advertRef, { images: advert.advertImages});
                                console.log(`${filenameToUpload} başarıyla firebase'e eklendi.`);
                                await getAdvertImages(app, advert);
                            }
                        )
                        
                    }
                }
            });

            // Step 4
            document.getElementById("advert-document-container").innerHTML = `
                <div class="clearfix padding-top-40">
                    <h3> Varolan Belge:</h3>
                    <iframe src="${await getDocumentFromStorage(app, advert.documentPath)}" width="100%" height="600px"></iframe>
                </div>
            `;
            document.getElementById("advert-document").addEventListener("change", async function(event) {
                await uploadPDF(app, advert);
            });
            

            document.getElementById("advert-update-button").addEventListener("click", async function() {
                const updatedAdvert = {
                    Id: advert.id,
                    AdvertTitle: document.getElementById("advert-title").value,                   
                    Price: Number(document.getElementById("advert-price").value),                          
                    Description: document.getElementById("advert-description").value,                
                    Address: document.getElementById("advert-address").value,                       
                    SquareMeterGross: Number(document.getElementById("advert-square-meter-gross").value),               
                    SquareMeterNet: Number(document.getElementById("advert-square-meter-net").value),                 
                    RoomNumber: document.getElementById("advert-room-number").value,                    
                    BuildingAge: Number(document.getElementById("advert-building-age").value),                    
                    NumberOfBathrooms: Number(document.getElementById("advert-number-of-bathrooms").value),              
                    NumberOfFloors: Number(document.getElementById("advert-number-of-floors").value),             
                    HasGarage: document.getElementById("advert-has-garage").checked,                  
                    IsFurnished: document.getElementById("advert-is-furnished").checked,                
                    HasLift: document.getElementById("advert-has-lift").checked,                    
                    HaveCellar: document.getElementById("advert-have-cellar").checked,                 
                    IsCloseToHealthCenter: document.getElementById("advert-is-close-health-center").checked,      
                    IsCloseToSchool: document.getElementById("advert-is-close-school").checked,            
                    IsInSite: document.getElementById("advert-is-in-site").checked,                   
                    Heating: Number(document.querySelector('.heatingPicker select').value),                        
                    Dues: Number(document.getElementById("advert-dues").value),                           
                    AddressDistrictID: Number(document.querySelector('.districtPicker select').value),           
                    AddressQuarterID: Number(document.querySelector('.quarterPicker select').value),            
                    Side: Number(document.querySelector('.sidePicker select').value),                           
                    WhichFloor: Number(document.getElementById("advert-which-floor").value),                     
                    Video: convertToEmbed(document.getElementById("advert-video").value),                         
                    AdvertImages: advert.advertImages,                  
                    BalconyCount: Number(document.getElementById("advert-balcony-count").value),                   
                    DocumentPath: advert.documentPath,                  
                    Status: Number(document.querySelector('.statusPicker select').value) === 1,                     
                    UserID: localStorage.getItem("userId"),
                    BuildingFloors: Number(document.getElementById("advert-building-floors").value),                 
                    Approved: false,
                    PublishDate: advert.publishDate,
                    OwnerPhone: document.getElementById("advert-property-owner-phone").value,
                    IslandNumber: Number(document.getElementById("advert-property-island-number").value),
                    ParcelNumber: Number(document.getElementById("advert-property-parcel-number").value)
                };

                try {
                    const response = await fetch(`/adverts/edit/${advert.id}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedAdvert)
                    });
        
                    if (response.ok) {
                        const data = await response.json();
                        console.log("İlan başarıyla güncellendi:", data);
                        window.location.href = `/home`;
                    } else {
                        const errorData = await response.json();
                        console.error("İlan eklenirken hata oluştu:", errorData);
                    }
                } catch (error) {
                    console.error("Veri gönderilirken bir hata oluştu:", error);
                }
            });
            
        }
});
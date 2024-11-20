import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";


const getRequestById = async (id) => {
    const url = `/adverts/get-request-details/${id}`;

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

const getUserById = async (id) => {
    const url = `/users/get-details/${id}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            console.log("Kullanıcı bulunamadı");
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

const getUserPhotoFromStorage = async (app, user) => {
    const storage = getStorage(app);

    const userImageRef = ref(storage, user.imgPath);
    try {
        const userImageUrl = await getDownloadURL(userImageRef);
        return userImageUrl;
    } catch (error) {
        const defaultImageRef = ref(storage, 'user_photos/default_user_photo.jpg');
        const defaultImageUrl = await getDownloadURL(defaultImageRef);
        return defaultImageUrl;
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

const getImagesAndPopulateSlider = async (storage, imagePaths) => {
    const gallery = document.getElementById("lightSlider");
    const defaultThumbnailUrl = "https://firebasestorage.googleapis.com/v0/b/obidatabase-3e651.appspot.com/o/default_advert_thumbnail.webp?alt=media&token=7d5b7089-afcb-414b-a31c-cda31dbae71e";
    let imagesLoaded = 0;

    if (imagePaths.length === 0) {
        const li = document.createElement("li");
        li.setAttribute("data-thumb", defaultThumbnailUrl);
        li.style.width = "720px";
        gallery.style.marginBottom = "3rem";

        const img = document.createElement("img");
        img.setAttribute("src", defaultThumbnailUrl);
        img.style.height = "423px";
        img.style.width = "100%";

        li.appendChild(img);
        gallery.appendChild(li);

        img.onload = () => {
            document.getElementById("preloader").style.display = "none";
            $("#lightSlider").lightSlider({
                gallery: true,
                item: 1,
                loop: true,
                thumbItem: 9,
                slideMargin: 0,
                enableDrag: true,
                currentPagerPosition: 'left',
            });
        };
    } else {
        for (let i = 0; i < imagePaths.length; i++) {
            const imagePath = imagePaths[i];
            const storageRef = ref(storage, imagePath);

            try {
                const url = await getDownloadURL(storageRef);
                const li = document.createElement("li");
                li.setAttribute("data-thumb", url);
                li.style.width = "720px";

                const img = document.createElement("img");
                img.setAttribute("src", url);

                li.appendChild(img);
                gallery.appendChild(li);

                img.onload = () => {
                    imagesLoaded++;
                    if (imagesLoaded === imagePaths.length) {
                        document.getElementById("preloader").style.display = "none";
                        $("#lightSlider").lightSlider({
                            gallery: true,
                            item: 1,
                            loop: true,
                            thumbItem: 9,
                            slideMargin: 0,
                            enableDrag: true,
                            currentPagerPosition: 'left',
                        });
                    }
                };
            } catch (error) {
                console.error("Resmi alırken hata:", error);
            }
        }
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


document.addEventListener("DOMContentLoaded", async function () {
    const extraDetails = [
        { key: "hasLift", label: "ASANSÖR", type: "boolean" },
        { key: "haveCellar", label: "KİLER", type: "boolean" },
        { key: "isCloseToHealthCenter", label: "SAĞLIK OCAĞINA YAKIN", type: "boolean" },
        { key: "isCloseToSchool", label: "OKULA YAKIN", type: "boolean" },
        { key: "isFurnished", label: "EŞYALI", type: "boolean" },
        { key: "isInSite", label: "SİTE İÇERİSİNDE", type: "boolean" },
        { key: "hasGarage", label: "OTOPARK", type: "boolean" },
        { key: "isEarthquakeResistant", label: "DEPREME DAYANIKLI", type: "boolean" },
    ];

    const sideTypes = {
        0: "Kuzey",
        1: "Kuzey Doğu",
        2: "Doğu",
        3: "Güney Doğu",
        4: "Güney",
        5: "Güney Batı",
        6: "Batı",
        7: "Kuzey Batı"
    }

    const heatingTypes = {
        0: "Merkezi Doğalgaz",
        1: "Bireysel Doğalgaz",
        2: "Kömür",
        3: "Soba",
        4: "Yerden Isıtma",
        5: "Isı Pompası",
    }

    try {
        const app = await getFirebaseConfigurations();
        const db = getFirestore(app);
        const storage = getStorage(app);

        const path = window.location.pathname;
        const advertId = path.split('/').pop();
        const data = await getAdvertById(advertId);

        if (data) {
            getImagesAndPopulateSlider(storage, data.advertImages);
            document.getElementsByTagName("h1")[0].innerHTML = data.advertTitle;
            document.getElementsByTagName("h1")[1].innerHTML = data.advertTitle;
            const districtName = await getPlaceNameById(db, data.addressDistrictID);
            const quarterName = await getPlaceNameById(db, data.addressQuarterID);
            document.getElementById("advert-district-location").innerHTML = districtName;
            document.getElementById("advert-quarter-location").innerHTML = quarterName;
            document.getElementById("advert-price").innerHTML = data.price + " TL";
            document.getElementById("advert-description").innerHTML = data.description;
            document.getElementById("advert-status-value").innerHTML = data.status === true ? "Satılık" : "Kiralık";
            document.getElementById("advert-gross-m2-value").innerHTML = data.squareMeterGross + `<b class="property-info-unit"> m²</b>`;
            document.getElementById("advert-net-m2-value").innerHTML = data.squareMeterNet + `<b class="property-info-unit"> m²</b>`;
            document.getElementById("room-number-value").innerHTML = data.roomNumber;
            document.getElementById("advert-building-age-value").innerHTML = data.buildingAge;
            document.getElementById("advert-which-floor-value").innerHTML = data.whichFloor;
            document.getElementById("advert-building-floor-number-value").innerHTML = data.buildingFloors;
            document.getElementById("advert-balcony-count-value").innerHTML = data.balconyCount;
            document.getElementById("advert-number-of-bathrooms-value").innerHTML = data.numberOfBathrooms + " Banyo";
            document.getElementById("advert-side-value").innerHTML = sideTypes[data.side] ? sideTypes[data.side] + " Cephe" : "Diğer";
            document.getElementById("advert-heating-value").innerHTML = heatingTypes[data.heating] ? heatingTypes[data.heating] : "Diğer";
            document.getElementById("advert-dues-value").innerHTML = data.dues + " TL Aidat";
            document.getElementById("advert-video").setAttribute("src", data.video);
            document.getElementById("advert-adress-text").innerHTML = data.address;
            
            /*
            const date = new Date(data.publishDate);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();*/
            const months = new Map([
                ["January", "Ocak"],
                ["February", "Şubat"],
                ["March", "Mart"],
                ["April", "Nisan"],
                ["May", "Mayıs"],
                ["June", "Haziran"],
                ["July", "Temmuz"],
                ["August", "Ağustos"],
                ["September", "Eylül"],
                ["October", "Ekim"],
                ["November", "Kasım"],
                ["December", "Aralık"]
            ]);

            const date = data.publishDate;
            const dateSpliited = date.split(" ");
            const day = dateSpliited[1].replace(",", "");
            const month = months.get(dateSpliited[0]);
            const year = dateSpliited[2];
            let hours = parseInt(dateSpliited[4].split(":")[0]);
            const minutes = dateSpliited[4].split(":")[1];
            const seconds = dateSpliited[4].split(":")[2].split("")[0] + dateSpliited[4].split(":")[2].split("")[1];
            const period = dateSpliited[4].split(":")[2].split("")[3] + dateSpliited[4].split(":")[2].split("")[4];
            if (period === "PM" && hours !== 12) {
                hours += 12;
            } else if (period === "AM" && hours === 12) {
                hours = 0;
            }

            const formattedDate = `${day < 10 ? '0' + day : day} ${month} ${year} ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            document.getElementById("advert-upload-date-value").innerHTML = formattedDate;

            

            const detailsList = document.querySelector(".additional-details-list");
            extraDetails.forEach(field => {
                const listItem = document.createElement("li");
                const titleSpan = document.createElement("span");
                titleSpan.className = "col-xs-6 col-sm-4 col-md-4 add-d-title";
                titleSpan.textContent = field.label;
                const valueSpan = document.createElement("span");
                valueSpan.className = "col-xs-6 col-sm-8 col-md-8 add-d-entry";
                if (field.type === "boolean") {
                    valueSpan.textContent = data[field.key] ? "Evet" : "Hayır";
                } else {
                    valueSpan.textContent = data[field.key] || "";
                }

                listItem.appendChild(titleSpan);
                listItem.appendChild(valueSpan);

                detailsList.appendChild(listItem);
            });

            const user = await getUserById(data.userID);
            if (user) {
                const userImageUrl = await getUserPhotoFromStorage(app, user);
                document.getElementById("user-picture").src = userImageUrl;
                document.getElementById("user-picture").style.height = "100%";
                document.getElementById("whatsapp-button").setAttribute("href", `https://wa.me/${user.phoneNumber}/?text=Merhaba ${data.advertTitle} başlıklı dairenin detayları hakkında görüşmek istiyorum.`);
                document.getElementById("user-name").innerHTML = user.name + (user.midName === "" ? "" : " " + user.midName) + " " + user.surname;
                document.getElementById("user-facebook-link").setAttribute("href", user.facebookLink);
                document.getElementById("user-instagram-link").setAttribute("href", user.instagramLink);
                document.getElementById("user-document-number").innerHTML = user.authDocNumber;
                document.getElementById("user-email").innerHTML = user.email;
                let formattedPhoneNumber = user.phoneNumber.replace(/^\+90/, "0");
                formattedPhoneNumber = formattedPhoneNumber.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
                document.getElementById("user-phone-number").innerHTML = formattedPhoneNumber;
                document.getElementById("user-description").innerHTML = user.description.length > 100 ? user.description.slice(0, 100) + "..." : user.description;
            }

            document.getElementById("advert-document-container").innerHTML = `
            <div class="clearfix padding-top-40">
                <iframe src="${await getDocumentFromStorage(app, data.documentPath)}" width="100%" height="600px"></iframe>
            </div>
            `;
        }
    } catch (error) {
        console.error("Firebase başlatma hatası:", error);
    }
});
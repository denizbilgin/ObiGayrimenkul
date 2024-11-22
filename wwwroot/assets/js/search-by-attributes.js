import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

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
            throw new Error("Firebase yapýlandýrmasý alýnamadý");
        }

        const firebaseConfig = await response.json();
        const app = initializeApp(firebaseConfig);

        return app
    } catch (error) {
        console.log("Bir hata oluþtu:", error);
    }
};

document.addEventListener("DOMContentLoaded", async function () {
    const searchForm = document.querySelector(".search-widget form");

    searchForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const ilce = Number(document.querySelector('.districtPicker select').value);
        const mahalle = Number(document.querySelector('.quarterPicker select').value);
        const durum = Number(document.querySelector('.statusPicker select').value) === 1
        const minPrice = document.getElementById("price-range").getAttribute("data-slider-value").split(",")[0];
        const maxPrice = document.getElementById("price-range").getAttribute("data-slider-value").split(",")[1];
        const minSquareMeters = document.getElementById("property-geo").getAttribute("data-slider-value").split(",")[0];
        const maxSquareMeters = document.getElementById("property-geo").getAttribute("data-slider-value").split(",")[1];
        const hasElevator = document.getElementById("asansor-checkbox").checked;
        const hasGarage = document.getElementById("otopark-checkbox").checked;
        const isFurnished = document.getElementById("esyali-checkbox").checked;
        const nearSchool = document.getElementById("okul-checkbox").checked;
        const nearHealthCenter = document.getElementById("saglik-checkbox").checked;
        const inSite = document.getElementById("siteicinde-checkbox").checked;
        const hasPantry = document.getElementById("kiler-checkbox").checked;
        const hasNaturalGas = document.getElementById("dogalgaz-checkbox").checked;

        const queryParams = new URLSearchParams({
            ilce,
            mahalle,
            durum,
            minPrice,
            maxPrice,
            minSquareMeters,
            maxSquareMeters,
            hasElevator,
            hasGarage,
            isFurnished,
            nearSchool,
            nearHealthCenter,
            inSite,
            hasPantry,
            hasNaturalGas
        });

        try {
            const response = await fetch(`/adverts/search-adverts?${queryParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const adverts = await response.json();
                console.log("Arama sonuçlarý:", adverts);
                const app = await getFirebaseConfigurations();
                //const db = getFirestore(app);
                const storage = getStorage(app);

                const resultsContainer = document.getElementById("list-type");
                resultsContainer.innerHTML = "";

                for (const advert of adverts) {
                    const thumbnailUrl = await getThumbnailUrl(storage, advert.advertImages[0]);
                    const advertDetailUrl = "adverts/" + advert.id
                    const advertHTML = `
                       <div class="col-sm-6 col-md-3 p0">
                        <div class="box-two proerty-item">
                            <div class="item-thumb">
                                <a href="${advertDetailUrl}"><img src="${thumbnailUrl}"></a>
                            </div>
                            <div class="item-entry overflow">
                                <h5><a href="${advertDetailUrl}">${advert.advertTitle}</a></h5>
                                <div class="dot-hr"></div>
                                <span class="pull-left"><b> Area :</b> ${advert.squareMeterGross}m</span>

                                <span class="proerty-price pull-right"> $ ${advert.price}</span>
                                <p style="display: none;">${advert.description}</p>
                                <div class="property-icon">
                                    <img src="assets/img/icon/district.png"><p style="margin-right: 1rem; display: inline;">${advert.addressDistrictID}</p>
                                    <img src="assets/img/icon/room.png">${advert.roomNumber}
                                </div>
                            </div>
                        </div>
                    </div>`;
                    resultsContainer.innerHTML += advertHTML;
                };
            } else {
                console.error("Arama baþarýsýz:", response.statusText);
                alert("Arama sýrasýnda bir hata oluþtu.");
            }
        } catch (error) {
            console.error("Bir hata oluþtu:", error);
            alert("Arama iþlemi sýrasýnda bir hata oluþtu.");
        }
    });
});


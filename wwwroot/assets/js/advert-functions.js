import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const getPlaceNameById = async (db, place_id) => {
    try {
        const docRef = doc(db, 'district_and_quarters', String(place_id));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return capitalize(data.sehir_ilce_mahalle_adi);
        } else {
            console.log(`${place_id} IDsine sahip belge bulunamadı.`);
            return null;
        }
    } catch (error) {
        console.error("Hata oluştu: ", error);
        return null;
    }
};

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

const capitalize = (str) => {
    if (typeof str !== 'string') return '';
    str = str.toLowerCase()
    return str.charAt(0).toUpperCase() + str.slice(1);
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

const toggleActiveClass = (clickedButton, otherButton) => {
    const clickedParent = clickedButton.parentElement;
    const otherParent = otherButton.parentElement;

    if (!clickedParent.classList.contains("active")) {
        clickedParent.classList.add("active");
    }

    if (otherParent.classList.contains("active")) {
        otherParent.classList.remove("active");
    }
};

const parseFirebaseDate = (firebaseDateString) => {
    const cleanedDateString = firebaseDateString.replace(" at", "").replace(" UTC+3", "");
    
    const result = new Date(cleanedDateString);
    return result;
};

function getStatusValue() {
    let data = Number(document.querySelector('.statusPicker select').value);
    if (data === 1) {
        return true;
    } else if(data === 2) {
        return false;
    } else {
        return null;
    }
}

const showAdverts = async (adverts) => {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);
    const storage = getStorage(app);

    document.getElementById("list-type").innerHTML = "";

    const dateOrderedSortedAdverts = [...adverts].sort((a, b) => parseFirebaseDate(b.publishDate) - parseFirebaseDate(a.publishDate));
    const priceOrderedSortedAdverts = [...adverts].sort((a, b) => a.price - b.price);

    const advertsPerPage = 8;
    let currentPage = 1;

    const advertsContainer = document.getElementById("list-type");
    const paginationContainer = document.querySelector(".pagination ul");

    const updatePagination = (sortedAdverts) => {
        const totalPages = Math.ceil(sortedAdverts.length / advertsPerPage);
        paginationContainer.innerHTML = '';
    
        // Prev button
        const prevButton = document.createElement('li');
        prevButton.innerHTML = '<a href="#">Önceki</a>';
        prevButton.classList.toggle('disabled', currentPage === 1);
        prevButton.addEventListener('click', () => changePage(currentPage - 1, sortedAdverts));
        paginationContainer.appendChild(prevButton);
    
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('li');
            pageButton.innerHTML = `<a href="#">${i}</a>`;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => changePage(i, sortedAdverts));
            paginationContainer.appendChild(pageButton);
        }
    
        // Next button
        const nextButton = document.createElement('li');
        nextButton.innerHTML = '<a href="#">Sonraki</a>';
        nextButton.classList.toggle('disabled', currentPage === totalPages);
        nextButton.addEventListener('click', () => changePage(currentPage + 1, sortedAdverts));
        paginationContainer.appendChild(nextButton);
    };

    const changePage = (page, sortedAdverts) => {
        currentPage = page;
        const startIndex = (currentPage - 1) * advertsPerPage;
        const endIndex = startIndex + advertsPerPage;
        const advertsToShow = sortedAdverts.slice(startIndex, endIndex);
    
        renderAdverts(advertsToShow);
        updatePagination(sortedAdverts);
    };

    const renderAdverts = async (adverts) => {
        console.log(adverts);
        advertsContainer.innerHTML = "";
        for (const advert of adverts) {
            const placeName = await getPlaceNameById(db, advert.addressDistrictID);
            const thumbnailUrl = await getThumbnailUrl(storage, advert.advertImages[0]);

            const advertCardHtml = `
                <div class="col-sm-6 col-md-3 p0">
                    <div class="box-two proerty-item">
                        <div class="item-thumb">
                            <a href="adverts/${advert.id}"><img src="${thumbnailUrl}"></a>
                        </div>
                        <div class="item-entry overflow">
                            <h5><a href="adverts/${advert.id}">${advert.advertTitle.length > 16 ? advert.advertTitle.slice(0, 16) + "..." : advert.advertTitle}</a></h5>
                            <div class="dot-hr"></div>
                            <span class="pull-left"><b> Alan :</b> ${advert.squareMeterGross} m²</span>
                            <span class="proerty-price pull-right">${advert.price} TL</span>
                            <div class="property-icon">
                                <img src="assets/img/icon/district.png"><p style="margin-right: 1rem; display: inline;" margin-left: 6px;> ${placeName}</p>
                                <img src="assets/img/icon/room.png"> ${advert.roomNumber}
                            </div>
                        </div>
                    </div>
                </div>`;
            advertsContainer.innerHTML += advertCardHtml;
        }
    };

    await changePage(currentPage, dateOrderedSortedAdverts);

    const orderByDateButton = document.getElementById("order-by-date");
    const orderByPriceButton = document.getElementById("order-by-price");

    orderByDateButton.addEventListener("click", async () => {
        currentPage = 1;
        toggleActiveClass(orderByDateButton, orderByPriceButton);
        await changePage(currentPage, dateOrderedSortedAdverts);
    });

    orderByPriceButton.addEventListener("click", async () => {
        toggleActiveClass(orderByPriceButton,orderByDateButton);
        currentPage = 1;
        await changePage(currentPage, priceOrderedSortedAdverts);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const response = await fetch("/adverts/index-search");
    let adverts = await response.json();
    await showAdverts(adverts);

    document.getElementById("search-btn").setAttribute("type", "button");
    document.getElementById("search-btn").addEventListener("click", async (event) => {
        event.preventDefault();
        var searchData = {
            selectedDistrictId : Number(document.querySelector('.districtPicker select').value) === 0 ? null: Number(document.querySelector('.districtPicker select').value),
            selectedQuartertId : Number(document.querySelector('.quarterPicker select').value) === 0 ? null: Number(document.querySelector('.quarterPicker select').value),
            selectedStatus : getStatusValue(),
            isHasLiftChecked : document.getElementById("index-search-has-lift").checked === true ? true: null,
            isHasCellarChecked : document.getElementById("index-search-has-cellar").checked === true ? true: null,
            isIsCloseSchoolChecked : document.getElementById("index-search-is-close-school").checked === true ? true: null,
            isIsCloseHealthCenterChecked : document.getElementById("index-search-is-close-health-center").checked === true ? true: null,
            isIsFurnishedChecked : document.getElementById("index-search-is-furnished").checked === true ? true: null,
            isIsInSiteChecked : document.getElementById("index-search-is-in-site").checked === true ? true: null,
            isHasParkChecked : document.getElementById("index-search-has-park").checked === true ? true: null,
            minPrice : document.getElementById("index-min-price").value,
            maxPrice : Number(document.getElementById("index-max-price").value) === 0 ? null: Number(document.getElementById("index-max-price").value),
            minSquaremeter : document.getElementById("index-min-squaremeter").value,
            maxSquaremeter : Number(document.getElementById("index-max-squaremeter").value) === 0 ? null: Number(document.getElementById("index-max-squaremeter").value),
        }
        console.log(searchData);
        const queryParams = new URLSearchParams(searchData).toString();
        const response = await fetch(`/adverts/index-search/?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const adverts = await response.json();
            await showAdverts(adverts);
        }
    });
});

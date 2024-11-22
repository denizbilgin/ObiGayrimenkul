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

const capitalize = (str) => {
    if (typeof str !== 'string') return '';
    str = str.toLowerCase()
    return str.charAt(0).toUpperCase() + str.slice(1);
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

const getPendingAdverts = async (id) => {
    const url = `/adverts/all-advert-requests`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'

            }
        });

        if (response.ok) {
            const advertsData = await response.json();
            return advertsData;
        } else {
            console.log("İlanlar bulunamadı");
        }
    } catch (error) {
        console.log("Bir hata oluştu:", error);
    }
};

document.addEventListener("DOMContentLoaded", async function () {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);
    const storage = getStorage(app);

    const adverts = await getPendingAdverts();
    console.log(adverts);

    const advertsContainer = document.getElementById("list-type");
    const paginationContainer = document.querySelector(".pagination ul");
    if (adverts.length === 0) {
        advertsContainer.innerHTML = "Şuanda bekleyen hiçbir ilan bulunmamaktadır.";
    } else {
        const advertsPerPage = 6;
            let currentPage = 1;

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

            
    }
});
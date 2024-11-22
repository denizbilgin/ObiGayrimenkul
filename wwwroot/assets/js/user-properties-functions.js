import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const getAdvertysByUserId = async (id) => {
    const url = `/adverts/get-user-adverts/${id}`;

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

async function fetchUsers() {
    const response = await fetch(`${window.location.origin}/users`);
    if (response.ok) {
        const users = await response.json();
        return users;
    } else {
        console.error("Kullanıcılar çekilemedi");
        return [];
    }
};

async function populateDropdown(defaultUser) {
    const users = await fetchUsers();
    const dropdowns = document.querySelectorAll(".user-dropdown");

    dropdowns.forEach((dropdown, index) => {
        dropdown.innerHTML = "";

        users.forEach(user => {
            const option = document.createElement("option");
            option.value = user.id;
            option.textContent = `${user.name} ${user.surname[0]}`;
            dropdown.appendChild(option);

            if (defaultUser && user.id === defaultUser.id) {
                option.selected = true;
            }
        });
    });
};

async function moveAdvertToAnotherUser(advert, destUserId, destUserName) {
    if (advert.userID === destUserId) {
        alert("İlan zaten bu kişiye atanmış halde");
        return;
    }

    const confirmation = confirm(`${advert.advertTitle} başlıklı ilanı ${destUserName} kişisine taşımak istediğinize emin misiniz?`);
    if (confirmation) {
        advert.userID = destUserId;
        try {
            const response = await fetch(`${window.location.origin}/adverts/edit-user/${advert.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(advert)
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("İlan başarıyla güncellendi:", data);
                location.reload();
            } else {
                const errorData = await response.json();
                console.error("İlan eklenirken hata oluştu:", errorData);
            }
        } catch (error) {
            console.error("Veri gönderilirken bir hata oluştu:", error);
        }
    } else {
        return;
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


document.addEventListener("DOMContentLoaded", async function () {
    const app = await getFirebaseConfigurations();
    const db = getFirestore(app);
    const storage = getStorage(app);

    const path = window.location.pathname;
    const userId = path.split('/').pop();

    const adverts = await getAdvertysByUserId(userId);
    const user = await getUserById(userId);
    console.log(adverts);
    console.log(user);

    if (user) {
        document.getElementById("user-name").innerHTML = user.name + (user.midName === "" ? "" : " " + user.midName) + " " + user.surname;

        const advertsContainer = document.getElementById("list-type");
        const paginationContainer = document.querySelector(".pagination ul");

        if (adverts.length === 0) {
            advertsContainer.innerHTML = "Şuanda hiçbir ilanınız bulunmamaktadır.";
        } else {
            const dateOrderedSortedAdverts = [...adverts].sort((a, b) => parseFirebaseDate(b.publishDate) - parseFirebaseDate(a.publishDate));
            const priceOrderedSortedAdverts = [...adverts].sort((a, b) => a.price - b.price);

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

            const renderAdverts = async (adverts) => {
                advertsContainer.innerHTML = "";
                for (const advert of adverts) {
                    const placeName = await getPlaceNameById(db, advert.addressDistrictID);
                const thumbnailUrl = await getThumbnailUrl(storage, advert.advertImages[0]);
                const vertificationIcon = advert.approved
                    ? '<img src="/assets/img/icon/verified.png" style="margin-top: 0.7rem;" alt="Onaylandı">'
                    : '<img src="/assets/img/icon/declined.png" style="margin-top: 0.7rem;" alt="Reddedildi">';


                const advertCardHtml = `
                    <div class="col-md-4 p0">
                        <div class="box-two proerty-item">
                            <div class="item-thumb">
                                <a href="${window.location.origin}/adverts/${advert.id}"><img src="${thumbnailUrl}"></a>
                            </div>
                            <div class="item-entry overflow">
                                <div class="row">
                                    <div class="col-md-10">
                                        <h5><a href="${window.location.origin}/adverts/${advert.id}"> ${advert.advertTitle.length > 30 ? advert.advertTitle.slice(0, 30) + "..." : advert.advertTitle} </a></h5>
                                    </div>
                                    <div class="col-md-2">
                                        ${vertificationIcon}
                                    </div>
                                </div>
                                <div class="dot-hr"></div>
                                <span class="pull-left"><b> Metrekare :</b> ${advert.squareMeterGross} m², <b>Odalar:</b> ${advert.roomNumber}</span>
                                <span class="proerty-price pull-right">${advert.price} TL</span>
                                <p style="display: none;">${advert.description.length > 100 ? advert.description.slice(0, 100) + "..." : advert.description + "<br><br>"}</p>
                                <div class="property-icon">
                                    <img src="/assets/img/icon/district.png">
                                    ${placeName}
                                    <div class="dealer-action pull-right">
                                        <a href="${window.location.origin}/adverts/edit/${advert.id}" class="button">GÜNCELLE </a>
                                        <select class="show-tick form-control user-dropdown" id="user-dropdown" placeholder="Durum"></select>
                                        <a class="button advert-move-button" style="cursor:pointer;" data-advert='${JSON.stringify(advert)}'>TAŞI</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                advertsContainer.innerHTML += advertCardHtml;

                document.querySelectorAll('.user-dropdown').forEach(async dropdown => {
                    await populateDropdown(user);
                });
                }
            };

            document.addEventListener("click", async (event) => {
                if (event.target.classList.contains("advert-move-button")) {
                    const moveButton = event.target;
                    const selectDropdown = moveButton.closest(".dealer-action").querySelector(".user-dropdown");
                    const selectedId = selectDropdown.value;
                    const selectedText = selectDropdown.options[selectDropdown.selectedIndex].text;
                    const advert = JSON.parse(moveButton.dataset.advert);
                    console.log(advert);
                    moveAdvertToAnotherUser(advert, selectedId, selectedText);
                }
            });

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
    }
});
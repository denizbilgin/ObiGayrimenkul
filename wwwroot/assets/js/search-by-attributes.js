document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.querySelector(".search-widget form");

    searchForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const minPrice = document.getElementById("price-range").getAttribute("data-slider-value").split(",")[0];
        const maxPrice = document.getElementById("price-range").getAttribute("data-slider-value").split(",")[1];
        const minSquareMeters = document.getElementById("property-geo").getAttribute("data-slider-value").split(",")[0];
        const maxSquareMeters = document.getElementById("property-geo").getAttribute("data-slider-value").split(",")[1];
        const hasElevator = document.querySelector("input[type='checkbox']:checked")?.value === "Asansör" || false;
        const hasGarage = document.querySelector("input[type='checkbox']:checked")?.value === "Otopark" || false;
        const isFurnished = document.querySelector("input[type='checkbox'][value='Eşyalı']")?.checked || false;
        const nearSchool = document.querySelector("input[type='checkbox'][value='Okul']")?.checked || false;
        const nearHealthCenter = document.querySelector("input[type='checkbox'][value='Sağlık ocağı']")?.checked || false;
        const inSite = document.querySelector("input[type='checkbox'][value='Site içerisinde']")?.checked || false;
        const hasPantry = document.querySelector("input[type='checkbox'][value='Kiler']")?.checked || false;

        const queryParams = new URLSearchParams({
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
            hasPantry
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
                console.log("Arama sonuçları:", adverts);

                const resultsContainer = document.getElementById("list-type");
                resultsContainer.innerHTML = "";

                adverts.forEach(advert => {
                    const thumbnailUrl = advert.advertImages[0] || "https://firebasestorage.googleapis.com/v0/b/obidatabase-3e651.appspot.com/o/default_advert_thumbnail.webp?alt=media&token=7d5b7089-afcb-414b-a31c-cda31dbae71e";
                    const advertDetailUrl = "adverts/requests/?id=" + advert.id
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
                });
            } else {
                console.error("Arama başarısız:", response.statusText);
                alert("Arama sırasında bir hata oluştu.");
            }
        } catch (error) {
            console.error("Bir hata oluştu:", error);
            alert("Arama işlemi sırasında bir hata oluştu.");
        }
    });
});


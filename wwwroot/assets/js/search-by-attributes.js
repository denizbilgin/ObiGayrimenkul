document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.querySelector(".search-widget form");

    searchForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Arama formundaki bilgileri al
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

        // Sorgu parametrelerini oluştur
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
            // Arama endpointine GET isteği gönder
            const response = await fetch(`/adverts/search-adverts?${queryParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                // Sonuçları al ve işle
                const adverts = await response.json();
                console.log("Arama sonuçları:", adverts);

                // Sonuçları ekranda göster
                const resultsContainer = document.getElementById("list-type");
                resultsContainer.innerHTML = ""; // Eski sonuçları temizle

                adverts.forEach(advert => {
                    const advertHTML = `
                        <div class="col-md-4">
                            <div class="property-card">
                                <img src="${advert.image || '/assets/img/default_advert.jpg'}" alt="Advert Image" />
                                <div class="property-details">
                                    <h4>${advert.title}</h4>
                                    <p>${advert.description}</p>
                                    <p><strong>Fiyat:</strong> ${advert.price} ₺</p>
                                    <a href="/adverts/${advert.id}" class="btn btn-primary">Detayları Gör</a>
                                </div>
                            </div>
                        </div>
                    `;
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


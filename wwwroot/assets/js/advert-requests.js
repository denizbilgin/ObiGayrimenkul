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

document.addEventListener("DOMContentLoaded", function () {
    fetch("/adverts/all-advert-requests")
    .then(response => response.json())
    .then(adverts => {
        const advertsContainer = document.getElementById("list-type");
        adverts.forEach(advert => {
            const thumbnailUrl = advert.advertImages[0] || "https://firebasestorage.googleapis.com/v0/b/obidatabase-3e651.appspot.com/o/default_advert_thumbnail.webp?alt=media&token=7d5b7089-afcb-414b-a31c-cda31dbae71e";
            const advertDetailUrl = "property-detail.html?id=" + advert.id

            const advertCardHtml = `
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
            advertsContainer.innerHTML += advertCardHtml;
        });
    })
});
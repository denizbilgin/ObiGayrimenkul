document.addEventListener("DOMContentLoaded", function () {
    fetch("/adverts")
    .then(response => response.json())
    .then(adverts => {
        const advertsContainer = document.getElementById("list-type");
        adverts.forEach(advert => {
            const advertCardHtml = `
                    <div class="col-sm-6 col-md-3 p0">
                        <div class="box-two proerty-item">
                            <div class="item-thumb">
                                <a href="property-detail.html"><img src="${advert.AdvertImages[0]}"></a>
                            </div>
                            <div class="item-entry overflow">
                                <h5><a href="property-detail.html">${advert.AdvertTitle}</a></h5>
                                <div class="dot-hr"></div>
                                <span class="pull-left"><b> Area :</b> ${advert.SquareMeterGross}m</span>

                                <span class="proerty-price pull-right"> $ ${advert.Price}</span>
                                <p style="display: none;">${advert.Description}</p>
                                <span> ${advert.Id}</span>
                                <div class="property-icon">
                                    <img src="assets/img/icon/district.png"><p style="margin-right: 1rem; display: inline;">${advert.district}</p>
                                    <img src="assets/img/icon/room.png">${advert.RoomNumber}
                                </div>
                            </div>
                        </div>
                    </div>`;
            advertsContainer.innerHTML += advertCardHtml
        });
    }).catch(error => console.error("Error fetching adverts:", error))
})


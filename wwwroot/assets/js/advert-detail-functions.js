// Get Advert Id from URL
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const advertId = urlParams.get('id');
    getAdvertById(advertId)
        .then(advert => {
            console.log(advert);
        })
        .catch(error => console.error("Error fetching advert:", error));
});


function getAdvertById(id) {
    return fetch(`/adverts/${id}`)
        .then(response => {
            if (!response.ok){
                throw new Error('Network response was not ok ' + response.statusText);            
            }
            return response.json()
        })
        .then(advert => {
            return advert;
        });
}


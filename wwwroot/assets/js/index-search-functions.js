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

document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("index-search-btn").setAttribute("type", "button");
    document.getElementById("index-search-btn").addEventListener("click", (event) => {
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
            maxPrice : document.getElementById("index-max-price").value === 0 ? null: document.getElementById("index-max-price").value,
            minSquaremeter : document.getElementById("index-min-squaremeter").value,
            maxSquaremeter : document.getElementById("index-max-squaremeter").value === 0 ? null: document.getElementById("index-max-squaremeter").value,
        }
        console.log(searchData);

        const queryParams = new URLSearchParams(searchData).toString();

        console.log(queryParams);

        fetch(`/adverts/index-search/?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Gelen Veriler:', data);
            // Veriyi işleyebilir veya UI üzerinde güncelleyebilirsiniz
        })
        .catch(error => {
            console.error('Hata:', error);
        });
    });

    
});
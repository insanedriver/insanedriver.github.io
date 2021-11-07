
const getQueryParameters = () => {
    let match, urlParams = {};
    const pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query = window.location.search.substring(1);

    while (match = search.exec(query)) {
        urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams;
};

const requestIsInBrazil = async () => {
    const apiUrl = 'http://ip-api.com/json';
    return fetch(apiUrl, {
        method: 'GET',
    }).then(async (response) => {
        const json = await response.json();
        const countryCode = json.countryCode;
        return countryCode == 'BR';
    }).catch((error) => {
        console.error(error);
        return false;
    });
};

const showPrices = (isFromBrazil) => {
    if (isFromBrazil) {
        $('#prices_brazil').show();
    } else {
        $('#prices_international').show();
    }
}

let $form, $products, $imageContainer;
const formIsReady = () => {
    $form = $('form:visible');
    $products = $(':input[name="os0"]', $form);
    $imageContainer = $('.image-container', $form);
    toggleImage();

    $products.change(() => {
        toggleImage();
    });
}

const imageCombo = $('#image-combo'),
    imageCd = $('#image-cd'),
    toggleImage = () => {
        const $selected = $products.filter(':checked')[0],
            isCombo = $selected.value.indexOf('COMBO') > -1;
        $imageContainer.html(isCombo ? imageCombo : imageCd);
    };

$(function () {
    const params = getQueryParameters();
    if (params.imInBrazil != null) {
        showPrices(params.imInBrazil == 'true');
        formIsReady();
    } else {
        requestIsInBrazil().then((isFromBrazil) => {
            showPrices(isFromBrazil);
            formIsReady();
        }).catch((error) => {
            console.error(error);
        });
    }
});

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

const imageCombo = $('#image-combo'),
    imageCd = $('#image-cd'),
    toggleImage = (form, value) => {
        const isCombo = value.indexOf('COMBO') > -1;
        $('.image-container', form).html(isCombo ? imageCombo : imageCd);
    };

$(function () {
    const params = getQueryParameters();
    if (params.imInBrazil != null) {
        showPrices(params.imInBrazil == 'true');
    } else {
        requestIsInBrazil().then((isFromBrazil) => {
            showPrices(isFromBrazil);
        }).catch((error) => {
            console.error(error);
        });
    }

    const $form = $('form:visible'),
        $products = $(':input[name="os0"]', $form);
    $products.change((e) => {
        toggleImage($form, e.target.value);
    });
    toggleImage($form, $products[0].value);
});
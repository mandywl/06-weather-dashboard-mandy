var items = [];
var latitude;
var longitude;
var index = 0;

function displayCurrentData(city) {
    var today = moment().format('L');
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=5b5ac65f68134f9e591aa02445eeaaf6";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //console.log(response);
        var iconcode = response.weather[0].icon;
        var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
        $(".city").html("<h3>" + city + " (" + today + ")" + "<img id='wicon' src='" + iconurl + "' alt='Weather icon'></h3>");
        $(".wind").text("Wind Speed: " + response.wind.speed + " MPH");
        $(".humidity").text("Humidity: " + response.main.humidity + "%");
        $(".uv").text("UV Index: ");
        // Convert the temp to fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(".temp").text("Temperature: " + tempF.toFixed(2) + "F");
    });
}

function displayUVIndex(city) {
    var geocoder = new google.maps.Geocoder();
    var address = city;


    geocoder.geocode({ 'address': address }, function (results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            latitude = results[0].geometry.location.lat();
            longitude = results[0].geometry.location.lng();
        }
    });
    var queryURL = "http://api.openweathermap.org/data/2.5/uvi?appid=5b5ac65f68134f9e591aa02445eeaaf6&lat=" + latitude + "&lon=" + longitude;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //console.log(response);

        $(".uv").text("UV Index: ");
    });
}

function displayFiveDayForecast(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",US&appid=5b5ac65f68134f9e591aa02445eeaaf6";
    var day1 = [];
    var day2 = [];
    var day3 = [];
    var day4 = [];
    var day5 = [];
    var days = [day1, day2, day3, day4];

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);

        for (var i = 0; i < response.list.length; i++) {

            switch (response.list[i].dt_txt.substring(0, 10)) {
                case moment().add(1, 'days').format().substring(0, 10):
                    day1.push(response.list[i]);
                    break;
                case moment().add(2, 'days').format().substring(0, 10):
                    day2.push(response.list[i]);
                    break;
                case moment().add(3, 'days').format().substring(0, 10):
                    day3.push(response.list[i]);
                    break;
                case moment().add(4, 'days').format().substring(0, 10):
                    day4.push(response.list[i]);
                    break;
                case moment().add(5, 'days').format().substring(0, 10):
                    day5.push(response.list[i]);
                    break;

            }

        }

        // console.log("day1 is", day1);
        // console.log("day2 is", day2);

        displayForecastData(day1[0]);
        displayForecastData(day2[0]);
        displayForecastData(day3[0]);
        displayForecastData(day4[0]);
        displayForecastData(day5[0]);
    });
}

function formatDate(unformatDate) {
    var unformatedDate = unformatDate.substr(0, unformatDate.indexOf(' '));
    var arrDate = unformatedDate.split("-");
    return arrDate[1] + "/" + arrDate[2] + "/" + arrDate[0];
}

function displayForecastData(day) {

    var $forecastContainer = $('<div class="forecast col-2 card text-white bg-primary mb-3 forecast' + index + '">')
    var $cardBody = $('<div class="card-body card-body' + index + '">');
    var $dateHeading = $('<h5 class="date' + index + '">' + '</h5>');
    var $forecastTemp = $('<p class="card-temp' + index + '">' + '</p>');
    var $forecastHumidity = $('<p class="card-humidity' + index + '">' + '</p>');
    $('#forecast').append($forecastContainer.append($cardBody.append($dateHeading).append($forecastTemp).append($forecastHumidity)));

    $(".date" + index).text(formatDate(day.dt_txt));
    $(".card-humidity" + index).text("Humidity: " + day.main.humidity + "%");

    // // Convert the temp to fahrenheit
    var tempF = (day.main.temp - 273.15) * 1.80 + 32;
    $(".card-temp" + index).text("Temp: " + tempF.toFixed(2) + " F");
    index++;
}

const history = JSON.parse(localStorage.getItem("weather-search-history")) || [];

function searchSmth(searchTerm) {
    saveSearchHistory(searchTerm);
}

function saveSearchHistory(searchTerm) {
    if (!history.includes(searchTerm)) {
        if (history.length > 5) {
            history.shift();
            history.push(searchTerm);
        } else {
            history.push(searchTerm);
        }
    }
    localStorage.setItem("weather-search-history", JSON.stringify(history));
    console.log(history);
}

function displaySearchResult() {
    $(".list-group").empty();

    for (var i = 0; i < history.length; i++) {
        $(".list-group-item").removeClass("active");
        $(".list-group").prepend('<li class="list-group-item active">' + history[i] + '</li>');
    }

    $(".list-group-item").on("click", function () {
        $('#forecast').empty();
        var city = $(this).text();
        displayCurrentData(city);
        displayFiveDayForecast(city)
        $(".list-group-item").removeClass("active");
        $(this).addClass("active");
    });
}

displayCurrentData(history[history.length - 1]);
displayUVIndex(history[history.length - 1])
//displayForecastContainer();
displayFiveDayForecast(history[history.length - 1]);
displaySearchResult();




// CLICK HANDLERS
// ==========================================================

// .on("click") function associated with the Search Button
$("#submit").on("click", function (event) {
    event.preventDefault();
    // Empty the region associated with the articles
    var searchedItem = $("#search-item").val().trim().toUpperCase();
    //console.log(searchedItem);
    displayCurrentData(searchedItem);
    displayFiveDayForecast(searchedItem);
    searchSmth(searchedItem);
    displaySearchResult();
});
var items = [];
var latitude;
var longitude;
var index = 0;
var activeItem = 5;
var apiKey = "5b5ac65f68134f9e591aa02445eeaaf6";

function displayCurrentData(city) {
  var today = moment().format("L");
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    apiKey;

  $.ajax({
    url: queryURL,
    method: "GET"
  })
    .then(function(response) {
      latitude = response.coord.lat;
      longitude = response.coord.lon;
      var iconcode = response.weather[0].icon;
      var iconurl = "https://openweathermap.org/img/w/" + iconcode + ".png";
      $(".city").html(
        "<h3>" +
          city +
          " (" +
          today +
          ")" +
          "<img id='wicon' src='" +
          iconurl +
          "' alt='Weather icon'></h3>"
      );
      $(".wind").text("Wind Speed: " + response.wind.speed + " MPH");
      $(".humidity").text("Humidity: " + response.main.humidity + "%");
      // Convert the temp to fahrenheit
      var tempF = (response.main.temp - 273.15) * 1.8 + 32;
      $(".temp").text("Temperature: " + tempF.toFixed(2));
      $(".temp").append("<span> &#176;F</span>");
      displayUVIndex(city, latitude, longitude);
      // save here cause its successful
      searchSmth(city);
      displaySearchResult();
    })
    .catch(function(error) {
      alert(error.responseJSON.message);
      // dont do anything here
    });
}

function displayUVIndex(city, latitude, longitude) {
  var queryURL =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    apiKey +
    "&lat=" +
    latitude +
    "&lon=" +
    longitude;
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    var uv = response.value;
    var color = "";
    switch (true) {
      case uv <= 3:
        color = "green";
        break;
      case uv > 3 && uv <= 6:
        color = "yellow";
        break;
      case uv > 6 && uv <= 8:
        color = " orange";
        break;
      case uv > 8 && uv <= 11:
        color = "red";
        break;
      case uv > 11:
        color = "violet";
        break;
    }

    $(".uv").text("UV Index: ");
    $(".uv").append(' <span class="uvText"> ' + uv + "</span > ");
    $(".uvText").css("background-color", color);
  });
}

function displayFiveDayForecast(city) {
  var queryURL =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    ",US&appid=" +
    apiKey;
  var day1 = [];
  var day2 = [];
  var day3 = [];
  var day4 = [];
  var day5 = [];

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    for (var i = 0; i < response.list.length; i++) {
      switch (response.list[i].dt_txt.substring(0, 10)) {
        case moment()
          .add(1, "days")
          .format()
          .substring(0, 10):
          day1.push(response.list[i]);
          break;
        case moment()
          .add(2, "days")
          .format()
          .substring(0, 10):
          day2.push(response.list[i]);
          break;
        case moment()
          .add(3, "days")
          .format()
          .substring(0, 10):
          day3.push(response.list[i]);
          break;
        case moment()
          .add(4, "days")
          .format()
          .substring(0, 10):
          day4.push(response.list[i]);
          break;
        case moment()
          .add(5, "days")
          .format()
          .substring(0, 10):
          day5.push(response.list[i]);
          break;
      }
    }

    displayForecastData(day1[0]);
    displayForecastData(day2[0]);
    displayForecastData(day3[0]);
    displayForecastData(day4[0]);
    displayForecastData(day5[0]);
  });
}

function formatDate(unformatDate) {
  var unformatedDate = unformatDate.substr(0, unformatDate.indexOf(" "));
  var arrDate = unformatedDate.split("-");
  return arrDate[1] + "/" + arrDate[2] + "/" + arrDate[0];
}

function displayForecastData(day) {
  var $forecastContainer = $(
    '<div class="forecast col-md-2 col-12 card text-white bg-primary mb-3 forecast' +
      index +
      '">'
  );
  var $cardBody = $('<div class="card-body card-body' + index + '">');
  var $dateHeading = $('<h5 class="date' + index + '">' + "</h5>");
  var $weatherIcon = $(
    '<img id="wicon" src="http://openweathermap.org/img/w/' +
      day.weather[0].icon +
      '.png"alt="Weather icon" class="icon' +
      index +
      '">'
  );
  var $forecastTempMin = $('<p class="card-temp-min' + index + '">' + "</p>");
  var $forecastTempMax = $('<p class="card-temp-max' + index + '">' + "</p>");
  var $forecastHumidity = $('<p class="card-humidity' + index + '">' + "</p>");
  $("#forecast").append(
    $forecastContainer.append(
      $cardBody
        .append($dateHeading)
        .append($forecastTempMin)
        .append($forecastTempMax)
        .append($forecastHumidity)
    )
  );

  $(".date" + index).text(formatDate(day.dt_txt));
  $(".date" + index).after($weatherIcon);
  $(".card-humidity" + index).text("Humidity: " + day.main.humidity + "%");

  // // Convert the temp to fahrenheit
  var tempF_min = (day.main.temp_min - 273.15) * 1.8 + 32;
  var tempF_max = (day.main.temp_max - 273.15) * 1.8 + 32;
  $(".card-temp-min" + index).text("Temp min: " + tempF_min.toFixed(2));
  $(".card-temp-max" + index).text("Temp max: " + tempF_max.toFixed(2));
  $(".card-temp-min" + index).append(" <span>&#176;F</span>");
  $(".card-temp-max" + index).append(" <span>&#176;F</span>");
  index++;
}

const history = JSON.parse(localStorage.getItem("weather-search-history")) || [
  "Melbourne,AU"
];

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
  } else {
    activeItem = history.findIndex(element => element === searchTerm);
  }
  localStorage.setItem("weather-search-history", JSON.stringify(history));
}

function displaySearchResult() {
  $(".list-group").empty();

  for (var i = 0; i < history.length; i++) {
    if (activeItem == i) {
      $(".list-group").prepend(
        '<li class="list-group-item active" data-index=' +
          i +
          ">" +
          history[i] +
          "</li>"
      );
    } else {
      $(".list-group").prepend(
        '<li class="list-group-item"  data-index=' +
          i +
          ">" +
          history[i] +
          "</li>"
      );
    }
  }
  $(".list-group-item").on("click", function() {
    $("#forecast").empty();
    var city = $(this).text();
    activeItem = $(this).attr("data-index");
    displayCurrentData(city);
    displayFiveDayForecast(city);
  });
}

displayCurrentData(history[history.length - 1]);
displayFiveDayForecast(history[history.length - 1]);
displaySearchResult();

// CLICK HANDLERS
// ==========================================================

// .on("click") function associated with the Search Button
$("#submit").on("click", function(event) {
  event.preventDefault();
  // Empty the region associated with the articles
  var searchedItem = $("#search-item")
    .val()
    .trim()
    .toUpperCase();
  searchedItem = searchedItem.replace(/\s*,\s*/g, ",");
  activeItem = 5;
  $("#forecast").empty();
  displayCurrentData(searchedItem);
  displayFiveDayForecast(searchedItem);
});

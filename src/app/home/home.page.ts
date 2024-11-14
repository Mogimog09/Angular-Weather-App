import { Component, OnInit } from '@angular/core';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

const API_URL = environment.API_URL;
const API_KEY = environment.API_KEY;
const FORECAST_KEY = environment.FORECAST_KEY;
const OVERVIEW = environment.OVERVIEW;




@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  alertButtons = ['Okay'];
iconforecast: string = 'assets/icon/weather-app.png';
iconhead: string = 'assets/icon/forecaster.png'
  lat: any | undefined;
  lon: any | undefined;
  firstLocation: any; // Variable to hold the first location object
  weatherData: any | undefined;
  base: string | undefined;
  clouds: number | undefined;
  cod: number | undefined;
  cityName: string | undefined;
  country: string | undefined;
  sunrise: string | undefined;
  sunset: string | undefined;
  timezone: number | undefined;
  visibility: number | undefined;
  description: string | undefined;
  icon: string | undefined;
  windSpeed: string | undefined;
  windDirection: string | undefined;
  windGust: string | undefined;
  temperature: string | undefined;
  feelsLike: string | undefined;
  humidity: string | undefined;
  pressure: string | undefined;
  tempMax: string | undefined;
  tempMin: string | undefined;
  todayDate = new Date();
  printicon: string | undefined;
  city:any |undefined;
  first: any | undefined;
  second: any | undefined;
  third: any | undefined;
  fourth: any | undefined;
  fifth: any | undefined;
  suggestions: any[] = []; // Array to store location suggestions

  constructor(public httpClient: HttpClient, public alertController: AlertController) {}

  ngOnInit() {
    console.log("Console is running");
    this.getUserLocation(); 
  }
  onCityChange(event: any) {
    const query = event.detail.value;
    if (query) {
      this.geocode(query); // Fetch geocode results when the input changes
    } else {
      this.suggestions = []; // Clear suggestions if input is empty
    }
  }
  geocode(city: string) {
    const geocodeURL = `https://geocode.maps.co/search?q=${city}&api_key=665f51fae75a5806956594pxk61a49c`;
    this.httpClient.get(geocodeURL).subscribe((results: any) => {
      console.log('Geocode Results:', results);
      if (results && results.length > 0) {
        this.suggestions = results; // Store the geocode results in the suggestions array
        console.log('Suggestions:', this.suggestions);
      } else {
        this.suggestions = []; // Clear suggestions if no results
      }
    });
  }
  
    // Select a suggestion and load weather data
  selectSuggestion(suggestion: any) {
    this.city = suggestion.display_name; // Set city name from the suggestion
    this.lat = suggestion.lat; // Set latitude from the suggestion
    this.lon = suggestion.lon; // Set longitude from the suggestion
    this.suggestions = []; // Clear suggestions after selection
  
    // Log for debugging
    console.log('Selected City:', this.city);
    console.log('Selected Latitude:', this.lat);
    console.log('Selected Longitude:', this.lon);
  
    // Fetch weather data based on the selected location
    this.loadWeatherData();  // Fetch weather data
    this.getOverview();      // Fetch overview data

    // Clear the search bar
  this.city = ''; // Clear the city input after selection
  }

  getOverview(){
    this.httpClient.get(`${OVERVIEW}?lat=${this.lat}&lon=${this.lon}&appid=${API_KEY}`).subscribe((over: any) => {
      console.log('Weather Overview:', over);
      const indices = [9, 18, 27, 36, 40];
      const extractedData = indices.map(index => {
          const item = over.list[index - 1];
          const celsiusTemp = (item.main.temp - 273.15).toFixed(2); // Convert Kelvin to Celsius and round to 2 decimals
          const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`; 
          return {
                date: new Date(item.dt * 1000),
                temperature: parseFloat(celsiusTemp), // Convert string to float
                description: item.weather[0].description,
                iconic: iconUrl,
                windSpeed: item.wind.speed
          };
      });
      console.log('Extracted Data:', extractedData);
// Access the first item
      this.first = extractedData[0];
      this.second = extractedData[1];
      this.third = extractedData[2];
      this.fourth = extractedData[3];
      this.fifth = extractedData[4];
  });}

  loadWeatherData() {
    this.httpClient.get(`${API_URL}?lat=${this.lat}&lon=${this.lon}&appid=${API_KEY}`).subscribe((results: any) => {
      console.log('Weather Data Results:', results);
     // Extract specific data and store it
     console.log('Weather Data Results:', results);
      
     this.weatherData = results;
     this.base = results.base;
     this.clouds = results.clouds?.all;
     this.cod = results.cod;
     this.cityName = results.name;
     this.country = results.sys?.country;
     this.sunrise = this.formatUnixTimestamp(results.sys?.sunrise);
     this.sunset = this.formatUnixTimestamp(results.sys?.sunset);
     this.timezone = results.timezone;
     this.visibility = results.visibility;
     this.description = results.weather[0]?.description;
     this.icon = results.weather[0]?.icon;
     this.windSpeed = this.formatNumber(results.wind?.speed);
     this.windDirection = this.formatNumber(results.wind?.deg);
     this.windGust = this.formatNumber(results.wind?.gust);
     this.temperature = this.formatNumber(this.convertKelvinToCelsius(results.main?.temp));
     this.feelsLike = this.formatNumber(this.convertKelvinToCelsius(results.main?.feels_like));
     this.humidity = this.formatNumber(results.main?.humidity);
     this.pressure = this.formatNumber(results.main?.pressure);
     this.tempMax = this.formatNumber(this.convertKelvinToCelsius(results.main?.temp_max));
     this.tempMin = this.formatNumber(this.convertKelvinToCelsius(results.main?.temp_min));
     this.printicon= `https://openweathermap.org/img/wn/${this.icon}@2x.png`;

      console.log(this.sunset);
      

    });
  }

  formatUnixTimestamp(timestamp: number | undefined): string | undefined {
    if (timestamp) {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('en-US');
    }
    return undefined;
  }

  convertKelvinToCelsius(kelvin: number | undefined): number | undefined {
    if (kelvin) {
      return kelvin - 273.15;
    }
    return undefined;
  }

  formatNumber(value: number | undefined): string | undefined {
    if (value !== undefined) {
      return value.toFixed(2);
    }
    return undefined;
  }



  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;
        
        // Now you can use latitude and longitude to fetch weather data or perform any other action
        console.log('User Location:', this.lat, this.lon);
        
        // For example, if you want to fetch weather data using the obtained coordinates
        this.getOverview();
        this.loadWeatherData(); 
        // Fetch weather data based on user's location
      }, (error) => {
        // If user location cannot be fetched, default to "Manila, Paco"
        
        // If user location cannot be fetched or geolocation is not supported, show alert
      console.error('Error getting user location:', error);
        this.presentErrorAlert();
        this.city = "Manila, Paco";
        this.geocode(this.city); // Fetch weather data for default city
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.city = "Manila, Paco";
        this.geocode(this.city); 
    }
}
async presentErrorAlert() {
  const alert = await this.alertController.create({
    header: 'Cannot fetch your location',
    subHeader: 'We ran into some trouble',
    message: 'Please enter a specific location instead',
    buttons: this.alertButtons // Define your alert buttons here or create them dynamically
  });

  await alert.present();
}

}
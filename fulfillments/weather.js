/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */
const axios = require('axios')
const config = require('../config')
const moment = require('moment')
const weather = require('../weather')
module.exports = {

    fulfillment: function (agent) {

        const [city, time, flightNo, date] = [agent.parameters['geo-city'], agent.parameters['time'], agent.parameters['flight-number'], agent.parameters['date']]
        let location = agent.parameters['location']             //Location may need to be filled so it's declared a let instead of const
        const flightNoFormatted = flightNo.replace(/\s/g, "")   //Strips the provided flight number from whitespaces for API use

        /**
         * Code to be executed when a flight number is provided by the user
         */

        if (flightNo) {

            //If non relevant data for a flight number is provided a response asking to clarify will be returned
            if (city || time || date) {
                agent.add(`That's a lot of data. Please either ask me the weather for your flight or by location. Thank you :)`)
            } else {
                //Get data regarding the provided flight number
                return axios.get(`http://aviation-edge.com/v2/public/flights?key=` + config.flightApiKey + `&flightIata=` + flightNoFormatted)
                    .then((response) => {

                        //Declaration of variable for the IATA number of an airport (this acts as a unique identifier)
                        let iataAirport, airportName
                        //Declaration of variable for the type of weather method (either future prediction current)
                        let weatherMethod

                        let latLng = {}


                        //Determine the asked location of the user: Departure airport, arrival airport or the current location of the flight
                        if (location == `current location`) {
                            //Set latitude and longitude for current location
                            latLng.latitude = response.data[0].geography.latitude
                            latLng.longitude = response.data[0].geography.longitude
                            weatherMethod = `current`
                        } else {


                            //If either departure of arrival is selected an additional API call needs to be made to determine the location of the airport
                            if (location == `departure`) {
                                iataAirport = response.data[0].departure.iataCode
                                weatherMethod = `current`

                            } else {
                                location = `arrival`    //If the location entity isn't provided, it will default to the arrival location
                                iataAirport = response.data[0].arrival.iataCode
                                weatherMethod = `forecast/hourly`
                            }

                            //Get data about either the departure or arrival airport
                            return axios.get(`https://aviation-edge.com/v2/public/airportDatabase?key=` + config.flightApiKey + `&codeIataAirport=` + iataAirport)
                                .then((response) => {
                                    let offset = parseInt(response.data[0].GMT)
                                    airportName = response.data[0].nameAirport

                                    //Set latitude and longitude for airport
                                    latLng.latitude = response.data[0].latitudeAirport
                                    latLng.longitude = response.data[0].longitudeAirport
                                    if (location == `arrival`) {
                                        return axios.get(`http://aviation-edge.com/v2/public/timetable?key=` + config.flightApiKey + `&iataCode=` + iataAirport + `&type=arrival&flight_iata=` + flightNoFormatted)
                                            .then((response) => {

                                                let time, localTimeReadable
                                                let weatherData = {}
                                                time = moment(response.data[0].arrival.scheduledTime).unix()

                                                if (offset > 0) {
                                                    offset = -Math.abs(offset * 3600)
                                                } else if (offset < 0) {
                                                    offset = Math.abs(offset * 3600)
                                                }
                                                localTimeReadable = moment(time * 1000).format(`hh:mm a`)
                                                time = time + offset

                                                return weather.get({
                                                    lat: latLng.latitude,
                                                    lon: latLng.longitude,
                                                    key: config.weatherApiKey,
                                                    method: `forecast/hourly`
                                                })
                                                    .then((response) => {
                                                        let weatherItems = {}

                                                        for (let entry of response) {
                                                            if (entry.ts > time) {
                                                                weatherData = {
                                                                    description: entry.weather.description,
                                                                    temp: entry.temp,
                                                                    windspeed: entry.wind_spd,
                                                                    windDirection: entry.wind_cdir_full
                                                                }
                                                                break
                                                            }
                                                        }

                                                        agent.add(
                                                            `Thank you for waiting! The weather for flight ` + flightNo + ` will be ` + weatherData.description + ` with ` + weatherData.temp + ` degrees when you land at ` + airportName + ` at ` + localTimeReadable + ` local time. Please enjoy the rest of your flight!`
                                                        )


                                                    }).catch(error => {
                                                        console.log(error)
                                                    })
                                            }).catch(error => {
                                                console.log(error)
                                            })
                                    } else if (location == `departure`) {
                                        agent.add(
                                            `ORIGIN OF FLIGHT + CURRENT WEATHER HERE`
                                        )
                                    }
                                }).catch(error => {
                                    console.log(error)
                                })
                        }

                    }).catch(error => {
                        console.log(error)
                    })
            }
        } else if (city) {
            return weather.get({
                city: city,
                key: config.weatherApiKey,
                method: `current`
            })
                .then((response) => {
                    const weatherData = {
                        description: response[0].weather.description,
                        temp: response[0].temp,
                        windspeed: response[0].wind_spd,
                        windDirection: response[0].wind_cdir_full
                    }

                    agent.add(
                        `Thank you for waiting! The weather in ` + city + ` is currently ` + weatherData.description + `. It is ` + weatherData.temp + ` degrees with a windspeed of ` + weatherData.windspeed + ` in a ` + weatherData.windDirection + ` direction.`
                    )


                }).catch(error => {
                    console.log(error)
                })

        } else {
            agent.add(
                `I will need more information to go by. Please ask again with a flight number or a city of your choice. Thank you!`
            )
        }
    }

}

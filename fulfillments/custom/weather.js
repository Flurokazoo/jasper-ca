/**
 * Intent: Check Weather Intent
 * Fulfillment: default
 */
const axios = require('axios')
const config = require('../../config')
const moment = require('moment')
const weather = require('../../weather')
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

                        //Code to be executed when no match can found for flight number
                        if (response.data.error) {
                            agent.add(
                                `I'm sorry, but it looks like that flight is not registered. Please ask my again with a valid flight number or city`
                            )
                        } else {
                            //Declaration of variable for the IATA number of an airport (this acts as a unique identifier)
                            let iataAirport, airportName
                            let latLng = {}


                            //Determine the asked location of the user: Departure airport, arrival airport or the current location of the flight
                            if (location == `current location`) {
                                //Set latitude and longitude for current location
                                latLng.latitude = response.data[0].geography.latitude
                                latLng.longitude = response.data[0].geography.longitude

                                //Makes a call to external weather function with parameters
                                return weather.get({
                                    lat: latLng.latitude,
                                    lon: latLng.longitude,
                                    key: config.weatherApiKey,
                                    method: `forecast/hourly`
                                })
                                    .then((response) => {
                                        //Fills weatherData with data returned from the function
                                        const weatherData = {
                                            description: response[0].weather.description,
                                            temp: response[0].temp,
                                            windspeed: response[0].wind_spd,
                                            windDirection: response[0].wind_cdir_full
                                        }
                                        //Add weather response to the agent
                                        agent.add(
                                            `Thank you for waiting! The weather for your current location is ` + weatherData.description + `. It is ` + weatherData.temp + ` degrees with a windspeed of ` + weatherData.windspeed + ` in a ` + weatherData.windDirection + ` direction. What else can I do for you?`
                                        )

                                    }).catch(error => {
                                        console.log(error)
                                    })


                            } else {

                                //If either departure of arrival is selected an additional API call needs to be made to determine the location of the airport
                                if (location == `departure`) {
                                    iataAirport = response.data[0].departure.iataCode
                                } else {
                                    location = `arrival`    //If the location entity isn't provided, it will default to the arrival location
                                    iataAirport = response.data[0].arrival.iataCode
                                }

                                //Get data about either the departure or arrival airport
                                return axios.get(`https://aviation-edge.com/v2/public/airportDatabase?key=` + config.flightApiKey + `&codeIataAirport=` + iataAirport)
                                    .then((response) => {
                                        let offset = parseInt(response.data[0].GMT)
                                        airportName = response.data[0].nameAirport

                                        //Set latitude and longitude for airport
                                        latLng.latitude = response.data[0].latitudeAirport
                                        latLng.longitude = response.data[0].longitudeAirport

                                        //This triggers if weather is to be searched for destination airport
                                        if (location == `arrival`) {
                                            return axios.get(`http://aviation-edge.com/v2/public/timetable?key=` + config.flightApiKey + `&iataCode=` + iataAirport + `&type=arrival&flight_iata=` + flightNoFormatted)
                                                .then((response) => {
                                                    //Fallback if the flight does not appear on the airport register. It is rare, but can happen.
                                                    if (response.data.error) {
                                                        agent.add(
                                                            `I'm sorry, but it looks like this flight is not registered at the destination airport yet. I can't get the info, so sorry...`
                                                        )
                                                    } else {
                                                        //Create variables for time and a readable time reference for return in the agent
                                                        let timeUnix, localTimeReadable
                                                        let weatherData = {}
                                                        //Create unix timestamp from the scheduled arrival time
                                                        timeUnix = moment(response.data[0].arrival.scheduledTime).unix()

                                                        /**
                                                         * Since the flight API gives back time data without including the difference for UTC time (which we need for creating an accurate timestamp)
                                                         * we want to offset the 'wrong' timestamp by the offset hours times 3600 (the amount of seconds in an hour).
                                                         * 
                                                         * Following that, we need to turn a '+' number to a '-'number and vice-versa. For example if the offset is 5 hours we need return -5 hours to
                                                         * bring the timestamp back to its correct value.
                                                         */

                                                        if (offset > 0) {
                                                            offset = -Math.abs(offset * 3600)
                                                        } else if (offset < 0) {
                                                            offset = Math.abs(offset * 3600)
                                                        }

                                                        //Sets the timestamp to a readable format
                                                        localTimeReadable = moment(timeUnix * 1000).format(`hh:mm a`)

                                                        //Offsets timeUnix by the right amount
                                                        timeUnix = timeUnix + offset

                                                        //Makes a call to external weather function with parameters
                                                        return weather.get({
                                                            lat: latLng.latitude,
                                                            lon: latLng.longitude,
                                                            key: config.weatherApiKey,
                                                            method: `forecast/hourly`
                                                        })
                                                            .then((response) => {
                                                                //A large set of weather data is returned, we need to see which timestamp best matches our own given timestamp by looping through them
                                                                for (let entry of response) {
                                                                    if (entry.ts > timeUnix) {
                                                                        weatherData = {
                                                                            description: entry.weather.description,
                                                                            temp: entry.temp,
                                                                            windspeed: entry.wind_spd,
                                                                            windDirection: entry.wind_cdir_full
                                                                        }

                                                                        //Break when the correct timestamp is found
                                                                        break
                                                                    }
                                                                }
                                                                //Add weather response to the agent
                                                                agent.add(
                                                                    `Thank you for waiting! The weather for flight ` + flightNo + ` will be ` + weatherData.description + ` with ` + weatherData.temp + ` degrees when you land at ` + airportName + ` at ` + localTimeReadable + ` local time. Please enjoy the rest of your flight! What else can I do for you?`
                                                                )
                                                            }).catch(error => {
                                                                console.log(error)
                                                            })
                                                    }

                                                }).catch(error => {
                                                    console.log(error)
                                                })

                                            //This triggers is weather is to be searched for departure airport
                                        } else if (location == `departure`) {

                                            //Makes a call to external weather function with parameters
                                            return weather.get({
                                                lat: latLng.latitude,
                                                lon: latLng.longitude,
                                                key: config.weatherApiKey,
                                                method: `current`
                                            })
                                                .then((response) => {
                                                    //Fills weatherData with data returned from the function
                                                    const weatherData = {
                                                        description: response[0].weather.description,
                                                        temp: response[0].temp,
                                                        windspeed: response[0].wind_spd,
                                                        windDirection: response[0].wind_cdir_full
                                                    }

                                                    //Add weather response to the agent
                                                    agent.add(
                                                        `Thank you for waiting! The weather at ` + airportName + ` at which flight ` + flightNo + ` departed at is currently ` + weatherData.description + `with ` + weatherData.temp + ` degrees. The windspeed is ` + weatherData.windspeed + ` with a direction of ` + weatherData.windDirection + `. What else can I do for you?`
                                                    )

                                                }).catch(error => {
                                                    console.log(error)
                                                })

                                        }
                                    }).catch(error => {
                                        console.log(error)
                                    })
                            }
                        }
                    }).catch(error => {
                        console.log(error)
                    })
            }

            /**
             * Code to be executed when a city is provided without a time
             */

        } else if (city && !time) {
            //Makes a call to external weather function with parameters
            return weather.get({
                city: city,
                key: config.weatherApiKey,
                method: `current`
            })
                .then((response) => {
                    //Fills weatherData with data returned from the function
                    const weatherData = {
                        description: response[0].weather.description,
                        temp: response[0].temp,
                        windspeed: response[0].wind_spd,
                        windDirection: response[0].wind_cdir_full
                    }

                    //Add weather response to the agent
                    agent.add(
                        `Thank you for waiting! The weather in ` + city + ` is currently ` + weatherData.description + `. It is ` + weatherData.temp + ` degrees with a windspeed of ` + weatherData.windspeed + ` in a ` + weatherData.windDirection + ` direction. What else can I do for you?`
                    )


                }).catch(error => {
                    console.log(error)
                })

            /**
             * Code to be executed when a city is provided with a time
             */

        } else if (city && time) {
            //Makes a call to external weather function with parameters
            return weather.get({
                city: city,
                key: config.weatherApiKey,
                method: `forecast/hourly`
            })
                .then((response) => {
                    let weatherData = {}
                    let timeUnix = moment(time).unix()
                    //Create a readable time variable for return
                    let timeReadable = moment(time).format(`hh:mm a`)

                    for (let entry of response) {
                        //A large set of weather data is returned, we need to see which timestamp best matches our own given timestamp by looping through them
                        if (entry.ts > timeUnix) {
                            weatherData = {
                                description: entry.weather.description,
                                temp: entry.temp,
                                windspeed: entry.wind_spd,
                                windDirection: entry.wind_cdir_full
                            }
                            break
                        }
                    }
                    //Add weather response to the agent
                    agent.add(
                        `The weather in ` + city + ` at ` + timeReadable + ` will be ` + weatherData.description + ` with a temperature of ` + weatherData.temp + ` degrees. The windspeed is ` + weatherData.windspeed + ` from a ` + weatherData.windDirection + ` direction. What else can I do for you?`
                    )

                }).catch(error => {
                    console.log(error)
                })
        }

        /**
         * If no parameters are given this code will be executed
         */

        else {
            agent.add(
                `I will need more information to go by. Please ask again with a flight number or a city of your choice. Thank you!`
            )
        }
    }

}

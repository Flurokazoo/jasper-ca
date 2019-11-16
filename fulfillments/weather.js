/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */
const axios = require('axios')
const config = require('../config')

module.exports = {

    fulfillment: function (agent) {

        const [city, time, flightNo, date] = [agent.parameters['geo-city'], agent.parameters['time'], agent.parameters['flight-number'], agent.parameters['date']]
        let location = agent.parameters['location']             //Location may need to be filled so it's declared a let instead of const
        const flightNoFormatted = flightNo.replace(/\s/g, "")   //Strips the provided flight number from whitespaces for API use
        let latLng = {}

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
                        let iataAirport

                        //Determine the asked location of the user: Departure airport, arrival airport or the current location of the flight
                        if (location == `current location`) {
                            //Set latitude and longitude for current location
                            latLng.latitude = response.data[0].geography.latitude
                            latLng.longitude = response.data[0].geography.longitude
                        } else {

                            //If either departure of arrival is selected an additional API call needs to be made to determine the location of the airport
                            if (location == `departure`) {
                                iataAirport = response.data[0].departure.iataCode
                            } else {
                                location = `arrival`    //If the location entity isn't provided, it will default to the arrival location
                                iataAirport = response.data[0].arrival.iataCode
                            }

                            //Get data about either the departure or arrival airport
                            axios.get(`https://aviation-edge.com/v2/public/airportDatabase?key=` + config.flightApiKey + `&codeIataAirport=` + iataAirport)
                                .then((response) => {
                                    //Set latitude and longitude for airport
                                    latLng.latitude = response.data[0].latitudeAirport
                                    latLng.longitude = response.data[0].longitudeAirport
                                })

                            // return axios.get(`http://aviation-edge.com/v2/public/timetable?key=` + config.flightApiKey + `&iataCode=` + iataAirport + `&type=` + location + `&flight_iata=` + flightNoFormatted)
                            //     .then((response) => {
                            //         console.log('de l;even')
                            //         //flightData = response.data.title
                            //         agent.add(
                            //             `deze leven is money money money`
                            //         )
                            //     })


                        }

                        return axios.get(`http://aviation-edge.com/v2/public/flights?key=` + config.flightApiKey + `&flightIata=` + flightNoFormatted)
                                .then((response) => {
                                    console.log('de l;even')
                                    //flightData = response.data.title
                                    agent.add(
                                        `deze leven is money money money`
                                    )
                                })

                    })
            }
        }
        agent.add(
            `hallo`
        )
    }

}

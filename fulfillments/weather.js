/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */
const axios = require('axios')
const config = require('../config')

module.exports = {

    fulfillment: function (agent) {


        const [city, time, location, flightNo, date] = [agent.parameters['geo-city'], agent.parameters['time'], agent.parameters['location'], agent.parameters['flight-number'], agent.parameters['date']]
        const flightNoFormatted = flightNo.replace(/\s/g, "")
        let latLng = {}

        if (flightNo) {
            if (city || time || date) {
                agent.add(`That's a lot of data. Please either ask me the weather for your flight or by location. Thank you :)`)
            } else {
                return axios.get(`http://aviation-edge.com/v2/public/flights?key=` + config.flightApiKey + `&flightIata=` + flightNoFormatted)
                    .then((response) => {
                        if (location == `current location`) {
                            latLng.latitude = response.data[0].geography.latitude
                            latLng.longitude = response.data[0].geography.longitude
                        } else {
                            let iataAirport
                            if (location == `departure`) {
                                iataAirport = response.data[0].departure.iataCode
                            } else {
                                iataAirport = response.data[0].arrival.iataCode
                            }
                            axios.get(`https://aviation-edge.com/v2/public/airportDatabase?key=` + config.flightApiKey + `&codeIataAirport=` + iataAirport)
                                .then((response) => {
                                    latLng.latitude = response.data[0].latitudeAirport
                                    latLng.longitude = response.data[0].longitudeAirport
                                })

                            return axios.get(`http://aviation-edge.com/v2/public/timetable?key=` + config.flightApiKey + `&iataCode=` + iataAirport + `&type=` + location + `&flight_iata=` + flightNoFormatted)
                                .then((response) => {
                                    console.log('check')
                                    //flightData = response.data.title
                                    agent.add(
                                        `http://aviation-edge.com/v2/public/timetable?key=` + config.flightApiKey + `&iataCode=` + iataAirport + `&type=` + location + `&flight_iata=` + flightNoFormatted
                                    )
                                })
                        }

                    })
            }
        }
    }

}

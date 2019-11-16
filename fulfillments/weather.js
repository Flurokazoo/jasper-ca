/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */
const axios = require('axios')
const config = require('../config')

module.exports = {

    fulfillment: function (agent) {

        console.log(config.flightApiKey)

        const [city, time, flightNo, date] = [agent.parameters['geo-city'], agent.parameters['time'], agent.parameters['flight-number'], agent.parameters['date']]
        let location = agent.parameters['location']
        const flightNoFormatted = flightNo.replace(/\s/g, "")
        let latLng = {}

        if (flightNo) {
            if (city || time || date) {
                agent.add(`That's a lot of data. Please either ask me the weather for your flight or by location. Thank you :)`)
            } else {
                return axios.get(`http://aviation-edge.com/v2/public/flights?key=` + config.flightApiKey + `&flightIata=` + flightNoFormatted)
                    .then((response) => {
                        let iataAirport
                        if (location == `current location`) {
                            latLng.latitude = response.data[0].geography.latitude
                            latLng.longitude = response.data[0].geography.longitude
                        } else {
                            if (location == `departure`) {
                                iataAirport = response.data[0].departure.iataCode
                            } else {
                                location = `arrival`
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

/**
 * Intent: Check Altitude Intent
 * Fulfillment: default
 */
const axios = require('axios')
const config = require('../../config')

module.exports = {

    fulfillment: function (agent) {
        const flightNo = agent.parameters['flight-number']
        const flightNoFormatted = flightNo.replace(/\s/g, "")

        /**
         * This runs if a flight number is provided
         */
        if (flightNo) {
            //Search flight by its IATA flight number
            return axios.get(`http://aviation-edge.com/v2/public/flights?key=` + config.flightApiKey + `&flightIata=` + flightNoFormatted)
                .then((response) => {
                    let altitude
                    if (response.data.error) {
                        //In the case a wrong flight number is provided, this will be the response
                        agent.add(
                            `I'm sorry, but it looks like that flight is not registered. Please ask my again with a valid flight number or city`
                        )
                    } else {
                        altitude = response.data[0].geography.altitude
                        //Add the response to the agent
                        agent.add(
                            `Our current altitude is ` + altitude + ` feet. Happy flight!`
                        )
                    }

                }).catch(error => {
                    console.log(error)
                })
            /**
            * This runs if no flight number is provided
            */
        } else {
            agent.add(
                `I'm sorry, but I need to know our flight number to fulfill this request.`
            )
        }

    }

}

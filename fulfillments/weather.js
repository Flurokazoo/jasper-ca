/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */
const axios = require('axios')

module.exports = {

    fulfillment: function (agent) {


        const [city, time, location, flightNo, date] = [agent.parameters['geo-city'], agent.parameters['time'], agent.parameters['location'], agent.parameters['flight-number'], agent.parameters['date']]
        let flightData

        if (flightNo) {
            if (city || time || date) {
                agent.add(`That's a lot of data. Please either ask me the weather for your flight or by location. Thank you :)`)
            } else {
                return axios.get('https://jsonplaceholder.typicode.com/todos/1')
                    .then((response) => {
                        flightData = response.data.title
                        agent.add(flightData)
                    })
            }
        }
    }

}

/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */

module.exports = {

    fulfillment: function (agent) {
        const axios = require('axios')


        const [city, time, location, flightNo, date] = [agent.parameters['geo-city'], agent.parameters['time'], agent.parameters['location'], agent.parameters['flight-number'], agent.parameters['date']]
        let flightData

        if (flightNo) {
            if (city || time || date) {
                agent.add('please be more specific')
            } else {
                return axios.get('https://jsonplaceholder.typicode.com/todos/1')
                    .then((response) => {
                        flightData = response.data.title
                        agent.add(flightData)
                    })
            }

        }

        // return axios.get('https://jsonplaceholder.typicode.com/todos/1')
        //     .then((response) => {
        //         agent.add(
        //             response.data.title
        //         )
        //     })



    }

}

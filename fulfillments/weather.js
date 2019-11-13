/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */

module.exports = {

    fulfillment: function (agent) {
        const axios = require('axios')

        const [city, time, location, flightNo, date] = [agent.parameters['geo-city'], agent.parameters['time'], agent.parameters['location'], agent.parameters['flight-number'], agent.parameters['date']]
        axios.get('https://jsonplaceholder.typicode.com/todos/1')
            .then(function (response) {
                console.log(response.data);
            })
           
        agent.add(
            `Check the weather.`
        )

    }

}

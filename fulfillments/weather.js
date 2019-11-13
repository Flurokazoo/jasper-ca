/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */

module.exports = {

    fulfillment: function (agent) {
        const [city, time, location, flightNo, date] = [agent.parameters['geo-city'], agent.parameters['time'], agent.parameters['location'], agent.parameters['flight-number'], agent.parameters['date']]
        agent.add(
            `Check the weather.`
        )

    }

}

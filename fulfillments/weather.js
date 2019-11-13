/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */

module.exports = {

    fulfillment: function (agent) {
    
        agent.add(
            `Check the weather.`
        )

    }

}

/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */

module.exports = {

    fulfillment: function (agent) {
    
        agent.add(
            `I'm sorry. I couldn't understand that.`
        )

    }

}

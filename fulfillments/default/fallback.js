/**
 * Intent: Default Fallback Intent
 * Fulfillment: default
 */

module.exports = {

    fulfillment: function (agent) {
    
        agent.add(
            `Ik heb je niet begrepen. Kijk in je Ciphix Conversational Automation Case omschrijving voor uitleg.`
        )

    }

}

/**
 * Intent: Default Welcome Intent
 * Fulfillment: default
 */

module.exports = {

    fulfillment: function (agent) {
        
        agent.add(
            `Hello pilot! My name is Smith and I'll be your assistent today. What can I do for you?`
        )

    }

}

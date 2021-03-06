const express = require('express')
const axios = require('axios')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()

/**
 * Require all intent fulfillment modules
 */
const f_welcome = require('./fulfillments/default/welcome')
const f_fallback = require('./fulfillments/default/fallback')
const f_weather = require('./fulfillments/custom/weather')
const f_altitude = require('./fulfillments/custom/altitude')
const f_destination = require('./fulfillments/custom/destination')


// Todo: create and require a fulfillment module for each custom intent
// Hint: use the directory fulfillments/custom

app.post('/', express.json(), (req, res) => {
  
  const agent = new WebhookClient({ request: req, response: res })
  let intentMap = new Map()
  
  /**
   * Connect fulfillment modules to Dialogflow intents
   */
  intentMap.set('Default Welcome Intent', f_welcome.fulfillment)
  intentMap.set('Default Fallback Intent', f_fallback.fulfillment)
  intentMap.set('Check weather', f_weather.fulfillment)
  intentMap.set('Check altitude', f_altitude.fulfillment)
  intentMap.set('Check destination', f_destination.fulfillment)


  // Connect the agent to the intent map
  agent.handleRequest(intentMap)

})

// Startup server on port 8080
app.listen(process.env.PORT || 8080)

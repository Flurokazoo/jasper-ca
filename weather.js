const axios = require('axios')


module.exports = {
    get: function (data) {
        return axios.get(`http://api.weatherbit.io/v2.0/` + data.method + `?lat=` + data.lat + `&lon=` + data.lon + `&key=` + data.key)
            .then((response) => {
                return(response.data.data)
                //return(`http://api.weatherbit.io/v2.0/` + data.method + `?lat=` + data.lat + `&lon=` + data.lon + `&key=` + data.key)
                
            }).catch(error =>{
                console.log(error)
            })
    }    
}
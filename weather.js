const axios = require('axios')


module.exports = {
    get: function (data) {
        let url
        if(data.city){
            url = `http://api.weatherbit.io/v2.0/` + data.method + `?city=` + data.city + `&key=` + data.key
            console.log(url)
        } else if (data.lat && data.lon){
            url = `http://api.weatherbit.io/v2.0/` + data.method + `?lat=` + data.lat + `&lon=` + data.lon + `&key=` + data.key
        }
        return axios.get(url)
            .then((response) => {
                return(response.data.data)
                
            }).catch(error =>{
                //console.log(error)
            })
    }    
}
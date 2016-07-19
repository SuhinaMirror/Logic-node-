reittiopas_service =
{
    expire: 120, // seconds
    parameters: [
        {name: 'src'},
        {name: 'dest'}
    ],
    returns: [
        {name: 'ttl', unit: 'seconds', prettyname: 'Time to leave'},
    ],
    raw_call: function(params, fn)
    {
        // params.source_address
        // params.destination_address
        // muitakin.. TODO!
        //

        //EKA KUTSU
        //http://api.reittiopas.fi/hsl/prod/?request=geocode&user=Laged&pass=Oispa3Kaliaa&key=teekkarikyla
        // -> hae osoite

        //TOKA KUTSU
        //http://api.reittiopas.fi/hsl/prod/?request=route&user=Laged&pass=Oispa3Kaliaa&from=2546445,6675512&to=2549445,6675513
        //(Insertoi uudet koordinaatit)
        // -> hae aika , bussi ja pysäkki (esim.)
        var urlSource = "http://api.reittiopas.fi/hsl/prod/?request=geocode&user=Laged&pass=Oispa3Kaliaa&key=" + params.src;
        var urlDestination = "http://api.reittiopas.fi/hsl/prod/?request=geocode&user=Laged&pass=Oispa3Kaliaa&key=" + params.dest;

        var source;
        var destination;

        var request = require("request")

        //Requestaa HTTP get reittioppaan sivuilta ja tallenna tiedot jonnekki
        request({
                    url: urlSource,
                    json: true
                }, function (error, response, body) {

                    if (!error && response.statusCode === 200) {
                        console.log("SOURCE: " + body[0].coords);
                        source = body[0].coords; // Print the json response
                    }
                })
        //
        request({
                    url: urlDestination,
                    json: true
                }, function (error, response, body) {

                    if (!error && response.statusCode === 200) {
                        console.log("DESTINATION: " + body[0].coords);
                        destination = body[0].coords; // Print the json response
                    }
                })

        var route = null;
        var urlRoute = 'http://api.reittiopas.fi/hsl/prod/?request=route&user=Laged&pass=Oispa3Kaliaa&from=' + source + '&to=' + destination;

        request({
                        url: urlRoute,
                        json: true
                    }, function (error, response, body) {

                        if (!error && response.statusCode === 200) {
                            console.log("ROUTE: " + response);
                            route = response[0][0]; // Print the json response
                            
                        }
                    })

        var legs = route.legs;
        var stopName = route.legs.locs[1].name;

        //Mihin kellonaikaan pitää lähteä
        var arrTime = legs[0].locs[0].arrTime;
        var firstDuration = legs[0].duration;
        var startTime = arrTime - firstDuration/60;

        //Kulkuvälineen numerokoodin hakeminen (esim. 2102 jos kyseessä bussi 102)
        var vehicleCode = legs[1].code.split(" ")[0];

        fn({
            'ttl': 10,
            'stopName' : stopName,
            'timeOfDeparture': startTime,
            'vehicleCode' : vehicleCode
        });
    }
};
test_service =
{
    expire: 10, // seconds
    parameters: [
        {name: 'src'},
        {name: 'dest'}
    ],
    returns: [
        {name: 'ttl', unit: 'seconds', prettyname: 'Time to leave'},
    ],
    raw_call: function(params, fn)
    {
        fn({
          'test_service': 'hello service!'
        });
    }
};

service_exports = {
    'reittiopas': reittiopas_service,
    'test_service': test_service
};

module.exports =
{
    services: service_exports,
    call_service: function(service_id, parameters, fn)
    {
        service = service_exports[service_id];
        // TODO: cache results here to avoid unnecessary calls to raw_call
        service.raw_call(parameters, fn);
    }
};

/*
reittiopas_service.raw_call({
    src: 'Siikakuja 2',
    dest: 'Mannerheimintie 60'
}, function(){
    console.log("joo")
})
*/

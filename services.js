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
        var urlDestination = "http://api.reittiopas.fi/hsl/prod/?request=geocode&user=Laged&pass=Oispa3Kaliaa&key=teekkarikyla" + params.dest;

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

        var route;
        var urlRoute = 'http://api.reittiopas.fi/hsl/prod/?request=route&user=Laged&pass=Oispa3Kaliaa&from=' + source + '&to=' + destination;

        request({
                        url: urlRoute,
                        json: true
                    }, function (error, response, body) {
                        console.log("KISSE");
                        console.log(error);
                        console.log(response);
                        if (!error && response.statusCode === 200) {
                            console.log("ROUTE: " + body);
                            route = response; // Print the json response
                        }
                    })

        fn({
            'ttl': 10,
            'route' : route
        });
    }
};

service_exports = {
    'reittiopas': reittiopas_service
};

module.exports =
{
    services: service_exports,
    call_service: function(parameters, fn)
    {
        service = service_exports[parameters.id];
        // TODO: cache results here to avoid unnecessary calls to raw_call
        service.raw_call(parameters, fn);
    }
};

reittiopas_service.raw_call({
    src: 'Siikakuja 2',
    dest: 'Mannerheimintie 60'
}, function(){
    console.log("joo")
})
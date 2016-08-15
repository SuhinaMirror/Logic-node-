reittiopas_service =
{
  expire: 120, // seconds
  parameters: [
    {name: 'src'},
    {name: 'dest'}
  ],
  returns: [
    {name: 'next_bus.stop_name', prettyname: 'Name of the bus stop'},
    {name: 'next_bus.time_of_departure', prettyname: 'Time when the bus leaves'},
    {name: 'next_bus.vehicle_code', prettyname: 'Bus line ID'},
  ],
  raw_call: (params) =>
  {
    //EKA KUTSU
    //http://api.reittiopas.fi/hsl/prod/?request=geocode&user=Laged&pass=Oispa3Kaliaa&key=teekkarikyla
    // -> hae osoite

    //TOKA KUTSU
    //http://api.reittiopas.fi/hsl/prod/?request=route&user=Laged&pass=Oispa3Kaliaa&from=2546445,6675512&to=2549445,6675513
    //(Insertoi uudet koordinaatit)
    // -> hae aika , bussi ja pysäkki (esim.)

    var urlSource = "http://api.reittiopas.fi/hsl/prod/?request=geocode&user=Laged&pass=Oispa3Kaliaa&key="
      + encodeURIComponent(params.src);
    var urlDestination = "http://api.reittiopas.fi/hsl/prod/?request=geocode&user=Laged&pass=Oispa3Kaliaa&key="
      + encodeURIComponent(params.dest);

    var fetch = require('node-fetch');
    let G = {};

    //Requestaa HTTP get reittioppaan sivuilta ja tallenna tiedot jonnekki
    return fetch(urlSource).then((x) => {return x.text()}).then((response_text) => {

      G.source = JSON.parse(response_text)[0].coords;

      return fetch(urlDestination).then((x)=>{return x.text();});
    }).then((response_text) => {

      G.destination = JSON.parse(response_text)[0].coords;
      var urlRoute = 'http://api.reittiopas.fi/hsl/prod/?request=route&user=Laged&pass=Oispa3Kaliaa&from=' + encodeURIComponent(G.source) + '&to=' + encodeURIComponent(G.destination);

      return fetch(urlRoute).then((x)=>{return x.text();});
    }).then((response_text) => {

      let route = JSON.parse(response_text)[0][0];

      let legs = route.legs;
      let stopName = legs[0].locs[1].name;

      //Mihin kellonaikaan pitää lähteä
      let arrTime = legs[0].locs[0].arrTime;
      let firstDuration = legs[0].duration;
      let startTime = arrTime - firstDuration/60;

      //Kulkuvälineen numerokoodin hakeminen (esim. 2102 jos kyseessä bussi 102)
      let vehicleCode = legs[1].code.split(" ")[0];

      let result_data = {
        'next_bus.stop_name' : stopName,
        'next_bus.time_of_departure': startTime,
        'next_bus.vehicle_code' : vehicleCode
      };

      return new Promise((resolve, reject) => {
        resolve(result_data);
      });
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
  raw_call: (params) => {
    return new Promise((resolve, reject) => {
      resolve({
        'test_service': 'hello service!'
      });
    });
  }
};

function objectEqual(a, b) {
  var x = Object.keys(a).sort();
  var y = Object.keys(b).sort();
  if (x.length != y.length) return false;

  for (var i = 0; i < x.length; i++)
    if (x[i] != y[i] || a[x[i]] != b[y[i]]) return false;

  return true;
}
var cache = [];

service_exports = {
  'reittiopas': reittiopas_service,
  'test_service': test_service
};

module.exports =
{
  services: service_exports,
  call_service: (service_id, parameters) =>
  {
    service = service_exports[service_id];
    // TODO: cache results here to avoid unnecessary calls to raw_call
    for (var i = cache.length - 1; i >= 0; i--) {
      if (cache[i].time < (Date.now()/1000 - service_exports[cache[i].service].expire)) {
        cache.splice(i, 1);
        continue;
      }
      if (cache[i].service != service_id || !objectEquals(parameters, cache[i].params))
        continue;

      return cache[i].result;
    }
    
    var res = {'service': service_id, time: Date.now()/1000, 'params': parameters, 'result': service.raw_call(parameters)};
    cache.push(res);
    return res.result;
  }
};

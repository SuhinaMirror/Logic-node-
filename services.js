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
        // hae reitti käyttäen params.src ja params.dest

        fn({
            'ttl': 10
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
    };
};

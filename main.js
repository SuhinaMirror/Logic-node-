var WebSocketServer = require('ws').Server;
var ws = new WebSocketServer({port: 8080});

ws.on('connection', function(ws){
    ws.on('message', function(msg){
        console.log('received: %s', msg);

        // handle message
        //

        msg = JSON.parse(msg);
        if (msg.method == 'update')
        {

        }
        else
        {
            console.log('unsupported method!');
        }

    });
    ws.send('welcome');
});

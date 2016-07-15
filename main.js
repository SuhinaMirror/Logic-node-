let WebSocketServer = require('ws').Server;
let ws = new WebSocketServer({port: 8080});

let Sequelize = require('sequelize');
let sequelize = new Sequelize('sqlite://db.sqlite');

let SensorState = sequelize.define('SensorState', {
    name: {type: Sequelize.STRING, unique: true},
    value: Sequelize.STRING
});

let services = require('./services');
let state = require('./state');

console.log(services.services);

SensorState.sync({force: true}).then(function(){
    // Table created
    ws.on('connection', function(ws){
        ws.on('message', function(msg){
            console.log('received: %s', msg);

            // handle message
            //
            msg = JSON.parse(msg);
            if (msg.method == 'set')
            {
                state.set(msg.key, msg.value);
                SensorState.upsert({
                    name: msg.key,
                    value: JSON.stringify(msg.value)
                });
            }
            else if(msg.method == 'get')
            {
                state.get(msg.key, function(value)
                {
                    ws.send(JSON.stringify(
                        {
                            key: ret.name,
                            value: re.value,
                            createdAt: ret.createdAt,
                            updateAt: ret.updatedAt,
                        }));
                });
            }
            else
            {
                console.log('unsupported method!');
            }
        });
        ws.send('welcome');
    });
});

var WebSocketServer = require('ws').Server;
var ws = new WebSocketServer({port: 8080});

var Sequelize = require('sequelize');
var sequelize = new Sequelize('sqlite://db.sqlite');

var SensorState = sequelize.define('SensorState', {
    name: {type: Sequelize.STRING, unique: true},
    value: Sequelize.STRING
}); 


var services = require('./services');

console.log(services.services);

SensorState.sync({force: true}).then(function(){
    // Table created
    ws.on('connection', function(ws){
        ws.on('message', function(msg){
            console.log('received: %s', msg);

            // handle message
            //
            msg = JSON.parse(msg);
            if (msg.method == 'update')
            {
                SensorState.upsert({
                    name: msg.key,
                    value: JSON.stringify(msg.value)
                });
            }
            else if(msg.method == 'get')
            {
                SensorState.findOne({
                    where: {
                        name: msg.key
                    }
                }).then(function(ret){
                    ws.send(JSON.stringify({
                        key: ret.name,
                        value: ret.value,
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

let WebSocketServer = require('ws').Server;
let wss = new WebSocketServer({port: 8080});

let Sequelize = require('sequelize');
let sequelize = new Sequelize('sqlite://db.sqlite', {logging: false});

let SensorState = sequelize.define('SensorState', {
    name: {type: Sequelize.STRING, unique: true},
    value: Sequelize.STRING
});

let services = require('./services');
let state = require('./state');

console.log(JSON.stringify(services.services, null, '\t'));

let clients = [];

function send_state()
{
  state.get_state().then((s) => {

    let msg = JSON.stringify(s);
    for (let i = 0; i < clients.length; ++i){
      clients[i].send(msg);
    }
    console.log('sending ' + msg);
  });
}

SensorState.sync({force: true}).then(() => {

  wss.on('connection', (conn) => {

    console.log('new connection');

    conn.send(JSON.stringify({hello: 'world'}));

    clients.push(conn);
    conn.on('close', (code, message) => {
      let idx = clients.indexOf(conn);
      if (idx >= 0)
        clients.splice(idx, 1);
    });

    conn.on('message', (msg) => {
      console.log('received: %s', msg);

      // handle message
      msg = JSON.parse(msg);
      if (msg.method == 'set') {
        state.set(msg.key, msg.value);
        SensorState.upsert({
          name: msg.key,
          value: JSON.stringify(msg.value)
        });
        send_state();
      }
      else if(msg.method == 'get') {
        state.get(msg.key).then((value) => {
          conn.send(JSON.stringify({
            key: ret.name,
            value: re.value,
            createdAt: ret.createdAt,
            updateAt: ret.updatedAt,
          }));
        });
      }
      else {
        console.log('unsupported  method!');
      }
    });
  });
  console.log('server started');
});

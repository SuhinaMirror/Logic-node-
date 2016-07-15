
var ws = new WebSocket("ws://127.0.0.1:8080/");

var messages = document.createElement('ul');
ws.onmessage = function (event)
{
    var messages = document.getElementsByTagName('ul')[0];
    var message = document.createElement('li');
    var content = document.createTextNode(event.data);
    message.appendChild(content);
    messages.appendChild(message);
};
document.body.appendChild(messages);

ws.onopen = function(event)
{
    ws.send(JSON.stringify({
        'method': 'update',
        'update': 'camera',
        'person': 'matti'
    }));
};



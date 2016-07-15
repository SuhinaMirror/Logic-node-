var G = {
  'state': {},
  'rules': [{
    'variable': 'active_user',
    'value': 'matti',
    'actions': [{
        'name': 'Next bus to Kamppi',
        'service': 'reittiopas',
        'service_args': {
          'src': 'Mäntyviita 5',
          'dest': 'Kamppi'
        }
    }]
  },{
    'variable': 'active_user',
    'value': 'joonas',
    'actions': [{
        'name': 'Fubar',
        'service': 'test_service',
        'service_args': {
          'src': 'Mäntyviita 5',
          'dest': 'Kamppi'
        }
    }]
  }]
};

let services = require('./services');
var clone = require('clone');

function get_state(key)
{
  return G.state[key];
};

function set_state(key, value)
{
  G.state[key] = value;
};

function _apply(state, rules, callback)
{
  // rules is an array, apply the topmost and recurse
  let len = rules.length;
  if (len == 0)
  {
    // no rules left, call callback
    callback(JSON.stringify(state));
    return;
  }

  let rule = rules[0];
  if (state[rule.variable] == rule.value)
  {
    // rule match, call service
    let args = clone(rule.service_args);
    services.call_service(rule.service, args, function(result)
    {
      for (var key in result)
      {
        if (!result.hasOwnProperty(key))
          continue;
        state[key] = result[key];
      }
      _apply(state, rules.slice(1), callback);
    });
  }
  else
  {
    // no match
    _apply(state, rules.slice(1), callback);
  };
};
function dump_state(callback)
{
  // unroll+copy rules so that each rule only one action
  let rules = [];
  for (var i=0; i<G['rules'].length;++i)
  {
    let rule = G['rules'][i];
    for (var a=0; a<rule['actions'].length;++a)
    {
      let act = rule['actions'][a];
      rules.push({
        'variable': rule['variable'],
        'value': rule['value'],
        'name': act['name'],
        'service': act['service'],
        'service_args': act['service_args']
      });
    }
  }
  _apply(clone(G['state']), clone(rules), callback);
}

module.exports =
{
    get: function(key, fn)
    {
        val = get_state(key);
        fn(val);
        /*
        SensorState.findOne(
        {
            where:
            {
                name: msg.key
            }
        }).then(function(ret)
        {
           fn(ret);
        });*/
    },
    set: function(key, value)
    {
        set_state(key, value);
        dump_state(function(s){console.log('dumped state: '+s);})
    }
}

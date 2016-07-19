let G = {
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
let clone = require('clone');

function get_state(key)
{
  return G.state[key];
};

function set_state(key, value)
{
  G.state[key] = value;
};

function _apply(state, rules)
{
  // rules is an array, apply the topmost and recurse
  let len = rules.length;
  if (len == 0) {
    // no rules left, call callback
    return new Promise((resolve, reject) => {
      resolve(clone(state));
    });
  }

  let rule = rules[0];
  if (state[rule.variable] == rule.value) {
    // rule match, call service
    let args = clone(rule.service_args);
    return services.call_service(rule.service, args).then((result) => {
      for (var key in result)
      {
        if (!result.hasOwnProperty(key))
          continue;
        state[key] = result[key];
      }
      return _apply(state, rules.slice(1));
    });
  }
  else {
    // no match
    return _apply(state, rules.slice(1));
  };
};
function dump_state()
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
  return _apply(clone(G['state']), clone(rules));
}

module.exports =
{
  get: (key) =>
  {
    return new Promise((resolve, reject) => {
      val = get_state(key);
      resolve(val);
    });
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
  set: (key, value) =>
  {
    set_state(key, value);
    dump_state().then((state) => {
      console.log('State is now:\n' + JSON.stringify(state, null, '\t'));
    });
  }
}

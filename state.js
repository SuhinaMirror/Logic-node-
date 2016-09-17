let G = {
  'state': {},
  'rules': [{
    'variable': 'active_user',
    'value': 'Laged',
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
    'value': 'Vino',
    'actions': [{
      'name': 'Next bus to JMT',
      'service': 'reittiopas',
      'service_args': {
        'src': 'Mäntyviita 5',
        'dest': 'JMT'
      }
    }]
  },{
    'variable': 'active_user',
    'value': 'joonas',
    'actions': [{
      'name': 'Fubar',
      'service': 'weather_service',
      'service_args': {
      }
    }]
  }]
};

let services = require('./services');
let clone = require('clone');

function get_state(key) {
  return G.state[key];
};

function set_state(key, value) {
  G.state[key] = value;
};

function apply_rule(state, rule)
{
  return new Promise((resolve, reject) => {
    if (state[rule.variable] == rule.value) {
      // rule match, call service
      let args = clone(rule.service_args);
      return services.call_service(rule.service, args).then((result) => {
        for (let key in result) {
          if (!result.hasOwnProperty(key))
            continue;
          state[key] = result[key];
        }
        resolve(state);
      });
    }
    else {
      // no match
      resolve(state);
    };
  });
};
function dump_state()
{
  // unroll+copy rules so that each rule only one action
  let rules = [];
  for (let i=0; i<G['rules'].length; ++i)
  {
    let rule = G['rules'][i];
    for (let a=0; a<rule['actions'].length; ++a)
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

  let state = clone(G.state);
  let prev = apply_rule(state, rules[0]);
  for (let i = 1; i < rules.length; ++i)
  {
    prev = prev.then(
        (state) =>
          apply_rule(state, rules[i])
    );
  }
  return prev;
}

module.exports =
{
  get: (key) => {
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
  set: (key, value) => {
    set_state(key, value);
    /*dump_state().then((state) => {
      console.log('State is now:\n' + JSON.stringify(state, null, '\t'));
    });*/
  },
  get_state: () => {
    return dump_state()
  }
}

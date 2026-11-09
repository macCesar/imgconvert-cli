'use strict';
// Internal compatibility adapter. The CLI is the supported public interface.
const { parseArgs } = require('node:util');
const { applyConfigPrecedence, validateOptions } = require('../config/precedence');
function parseArguments(argv) {
  const program = require('./program');
  const options = {};
  for (const option of program.options) {
    const key = option.long.slice(2);
    options[key] = { type: option.required || option.optional ? 'string' : 'boolean' };
    if (option.short) options[key].short = option.short.slice(1);
  }
  const parsed = parseArgs({args:argv,options,allowPositionals:true});
  const values = Object.fromEntries(Object.entries(parsed.values).map(([key,value]) => [key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),value]));
  return validateOptions({...values,_:parsed.positionals,presetName:values.preset,_userArgs:values});
}
module.exports = { parseArguments, applyConfigPrecedence };

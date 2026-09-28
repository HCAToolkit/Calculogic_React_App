#!/usr/bin/env node
// CLI for the Validator pin-consistency check: `npm run check:validator-pin [-- --checkout <path>]`
// (Refs #713). Contract: doc/nl-config/cfg-validatorPinConsistency.md §7.1.
//
// Runs when executed and exports nothing, so no module imports it. Exit 0 for `consistent` or
// `linked-development`, 1 for `failed`.

import { collectValidatorPinInputs } from './validator-pin-inputs.host.mjs';
import { evaluateValidatorPin, formatValidatorPinReport } from './validator-pin-consistency.logic.mjs';

const parseExplicitCheckout = (argv) => {
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--checkout') {
      if (!argv[index + 1]) {
        throw new Error('--checkout requires a path');
      }
      return argv[index + 1];
    }
    if (argument.startsWith('--checkout=')) {
      return argument.slice('--checkout='.length);
    }
    throw new Error(`Unknown argument: ${argument}. Usage: check-validator-pin [--checkout <path>]`);
  }
  return undefined;
};

try {
  const explicitCheckout = parseExplicitCheckout(process.argv.slice(2));
  const result = evaluateValidatorPin(collectValidatorPinInputs({ explicitCheckout }));
  for (const line of formatValidatorPinReport(result)) {
    process.stdout.write(`${line}\n`);
  }
  process.exitCode = result.status === 'failed' ? 1 : 0;
} catch (error) {
  process.stderr.write(`check-validator-pin: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

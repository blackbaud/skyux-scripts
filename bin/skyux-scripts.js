#!/usr/bin/env node

async function processCommand() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'strict-mode':
      await require('../lib/strict-mode')();
      break;
  }
}

processCommand();

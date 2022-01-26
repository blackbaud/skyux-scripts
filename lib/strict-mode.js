const logger = require('@blackbaud/skyux-logger');
const fs = require('fs-extra');
const path = require('path');

const jsoncUtils = require('./utils/jsonc-utils');

module.exports = async function strictMode() {
  logger.info('Loading root tsconfig.json file...');

  const cwd = process.cwd();
  const tsconfigPath = path.join(cwd, 'tsconfig.json');

  if (await fs.pathExists(tsconfigPath)) {
    const tsconfig = await jsoncUtils.readJsonC(tsconfigPath);

    logger.info('Updating compiler options...');

    tsconfig.compilerOptions = tsconfig.compilerOptions || {};

    Object.assign(tsconfig.compilerOptions, {
      strict: true,
      forceConsistentCasingInFileNames: true,
      noFallthroughCasesInSwitch: true,
      noImplicitReturns: true,
    });

    logger.info('Updating Angular compiler options...');

    tsconfig.angularCompilerOptions = tsconfig.angularCompilerOptions || {};

    Object.assign(tsconfig.angularCompilerOptions, {
      strictTemplates: true,
      strictInjectionParameters: true,
      strictInputAccessModifiers: true,
    });

    logger.info('Writing changes to tsconfig.json...');

    await jsoncUtils.writeJsonC(tsconfigPath, tsconfig);

    logger.info('Updated tsconfig.json successfully.');
  } else {
    logger.info('No root tsconfig.json file exists.');
  }
};

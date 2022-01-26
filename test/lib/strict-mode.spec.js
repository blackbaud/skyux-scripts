const commentJson = require('comment-json');
const mock = require('mock-require');
const path = require('path');

describe('strict-mode', () => {
  let fsExtraMock;
  let jsoncUtils;
  let loggerMock;
  let strictMode;

  async function validate(existingTsconfigJson, expectedTsconfigJson) {
    jsoncUtils.readJsonC.and.returnValue(
      Promise.resolve(commentJson.parse(existingTsconfigJson))
    );

    await strictMode();

    expect(jsoncUtils.writeJsonC).toHaveBeenCalledWith(
      path.join(process.cwd(), 'tsconfig.json'),
      commentJson.parse(expectedTsconfigJson)
    );
  }

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj('@blackbaud/skyux-logger', ['info']);
    jsoncUtils = jasmine.createSpyObj('jsonc-utils', [
      'readJsonC',
      'writeJsonC',
    ]);

    fsExtraMock = jasmine.createSpyObj('fs-extra', ['pathExists']);

    mock('@blackbaud/skyux-logger', loggerMock);
    mock('fs-extra', fsExtraMock);
    mock('../../lib/utils/jsonc-utils', jsoncUtils);

    strictMode = mock.reRequire('../../lib/strict-mode');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should display a message and exit if no tsconfig.json file exists', async () => {
    fsExtraMock.pathExists.and.returnValue(Promise.resolve(false));

    await strictMode();

    expect(loggerMock.info).toHaveBeenCalledWith(
      'No root tsconfig.json file exists.'
    );
    expect(jsoncUtils.readJsonC).not.toHaveBeenCalled();
  });

  it('should set the expected strict mode settings in tsconfig.json', async () => {
    fsExtraMock.pathExists.and.returnValue(Promise.resolve(true));

    await validate(
      `/* Some comment */
    {
      "compilerOptions": {
        "outDir": "./dist"
      },
      "angularCompilerOptions": {
        "enableI18nLegacyMessageIdFormat": false
      }
    }`,
      `/* Some comment */
    {
      "compilerOptions": {
        "forceConsistentCasingInFileNames": true,
        "noFallthroughCasesInSwitch": true,
        "noImplicitReturns": true,
        "outDir": "./dist",
        "strict": true,
      },
      "angularCompilerOptions": {
        "enableI18nLegacyMessageIdFormat": false,
        "strictTemplates": true,
        "strictInjectionParameters": true,
        "strictInputAccessModifiers": true
      }
    }`
    );
  });

  it('should add compilerOptions and angularCompilerOptions if they do not exist', async () => {
    fsExtraMock.pathExists.and.returnValue(Promise.resolve(true));

    await validate(
      '{}',
      `{
      "compilerOptions": {
        "forceConsistentCasingInFileNames": true,
        "noFallthroughCasesInSwitch": true,
        "noImplicitReturns": true,
        "strict": true,
      },
      "angularCompilerOptions": {
        "strictTemplates": true,
        "strictInjectionParameters": true,
        "strictInputAccessModifiers": true
      }
    }`
    );
  });
});

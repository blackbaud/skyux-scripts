const commentJson = require('comment-json');
const mock = require('mock-require');

describe('jsonc-utils', () => {
  let fsMock;
  let jsoncUtils;
  let prettierMock;

  beforeEach(() => {
    fsMock = jasmine.createSpyObj('fs-extra', ['readFile', 'writeFile']);

    fsMock.readFile.and.callFake(async (file) => {
      switch (file) {
        case 'foo.json':
          return Promise.resolve('/* Some comment */ { "foo": "bar" }');
      }
    });

    prettierMock = jasmine.createSpyObj('prettier', ['format']);

    mock('fs-extra', fsMock);
    mock('prettier', prettierMock);

    jsoncUtils = mock.reRequire('../../../lib/utils/jsonc-utils');
  });

  it('should read JSON with comments', async () => {
    const obj = await jsoncUtils.readJsonC('foo.json');

    expect(obj).toEqual({
      foo: 'bar',
    });
  });

  it('should write JSON with comments', async () => {
    prettierMock.format.and.callFake((contents) => contents);

    await jsoncUtils.writeJsonC(
      'foo.json',
      commentJson.parse(`
{
  "foo": "bar" // Some comment
}`)
    );

    const expectedWriteContents = `{
  "foo": "bar" // Some comment
}`;

    expect(prettierMock.format);

    expect(fsMock.writeFile).toHaveBeenCalledWith(
      'foo.json',
      expectedWriteContents
    );
  });

  it('should preserve the header block comment', async () => {
    prettierMock.format.and.returnValue(`/* Some comment */ {
  "foo": "bar"
}`);

    await jsoncUtils.writeJsonC(
      'foo.json',
      commentJson.parse(`/* Some comment */
{
  "foo": "bar"
}`)
    );

    expect(fsMock.writeFile).toHaveBeenCalledWith(
      'foo.json',
      `/* Some comment */
{
  "foo": "bar"
}`
    );
  });
});

import * as SentryNode from '@sentry/node';
import { getCurrentHub } from '@sentry/node';
import { getGlobalObject } from '@sentry/utils';

import { init } from '../src/index.server';

const global = getGlobalObject();

const nodeInit = jest.spyOn(SentryNode, 'init');

describe('Server init()', () => {
  afterEach(() => {
    jest.clearAllMocks();
    global.__SENTRY__.hub = undefined;
  });

  it('inits the Node SDK', () => {
    expect(nodeInit).toHaveBeenCalledTimes(0);
    init({});
    expect(nodeInit).toHaveBeenCalledTimes(1);
    expect(nodeInit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        _metadata: {
          sdk: {
            name: 'sentry.javascript.remix',
            version: expect.any(String),
            packages: [
              {
                name: 'npm:@sentry/remix',
                version: expect.any(String),
              },
              {
                name: 'npm:@sentry/node',
                version: expect.any(String),
              },
            ],
          },
        },
      }),
    );
  });

  it("doesn't reinitialize the node SDK if already initialized", () => {
    expect(nodeInit).toHaveBeenCalledTimes(0);
    init({});
    expect(nodeInit).toHaveBeenCalledTimes(1);
    init({});
    expect(nodeInit).toHaveBeenCalledTimes(1);
  });

  it('sets runtime on scope', () => {
    const currentScope = getCurrentHub().getScope();

    // @ts-ignore need access to protected _tags attribute
    expect(currentScope._tags).toEqual({});

    init({});

    // @ts-ignore need access to protected _tags attribute
    expect(currentScope._tags).toEqual({ runtime: 'node' });
  });
});

import * as path from 'path';

import { getAPIResponse, runServer } from '../../../../utils/index';
import { TestAPIResponse } from '../server';

test('should ignore sentry-values in `baggage` header of a third party vendor and overwrite them with incoming DSC', async () => {
  const url = await runServer(__dirname, `${path.resolve(__dirname, '.')}/server.ts`);

  const response = (await getAPIResponse(new URL(`${url}/express`), {
    'sentry-trace': '',
    baggage: 'sentry-release=2.1.0,sentry-environment=myEnv',
  })) as TestAPIResponse;

  expect(response).toBeDefined();
  expect(response).toMatchObject({
    test_data: {
      host: 'somewhere.not.sentry',
      baggage: 'other=vendor,foo=bar,third=party,last=item,sentry-release=2.1.0,sentry-environment=myEnv',
    },
  });
});

test('should ignore sentry-values in `baggage` header of a third party vendor and overwrite them with new DSC', async () => {
  const url = await runServer(__dirname, `${path.resolve(__dirname, '.')}/server.ts`);

  const response = (await getAPIResponse(new URL(`${url}/express`), {})) as TestAPIResponse;

  expect(response).toBeDefined();
  expect(response).toMatchObject({
    test_data: {
      host: 'somewhere.not.sentry',
      baggage: expect.stringContaining(
        'other=vendor,foo=bar,third=party,last=item,sentry-environment=prod,sentry-release=1.0,sentry-public_key=public',
      ),
    },
  });
});

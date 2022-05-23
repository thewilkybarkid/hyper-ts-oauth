import { Request, Response } from 'express'
import * as fc from 'fast-check'
import * as H from 'hyper-ts'
import { ExpressConnection } from 'hyper-ts/lib/express'
import { Headers, createRequest, createResponse } from 'node-mocks-http'

export * from 'fast-check'

export const url = (): fc.Arbitrary<URL> => fc.webUrl().map(url => new URL(url))

export const request = ({ headers }: { headers?: fc.Arbitrary<Headers> } = {}): fc.Arbitrary<Request> =>
  fc
    .record({
      headers: headers ?? fc.constant({}),
      url: fc.webUrl(),
    })
    .map(createRequest)

export const response = (): fc.Arbitrary<Response> => fc.record({ req: request() }).map(createResponse)

export const connection = <S = H.StatusOpen>(...args: Parameters<typeof request>): fc.Arbitrary<ExpressConnection<S>> =>
  fc.tuple(request(...args), response()).map(args => new ExpressConnection(...args))

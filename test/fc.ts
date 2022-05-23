import { Request, Response } from 'express'
import * as fc from 'fast-check'
import * as H from 'hyper-ts'
import { ExpressConnection } from 'hyper-ts/lib/express'
import { Headers, createRequest, createResponse } from 'node-mocks-http'

export * from 'fast-check'

export const url = ({ query }: { query?: fc.Arbitrary<URLSearchParams> } = {}): fc.Arbitrary<URL> =>
  fc.tuple(fc.webUrl(), query ?? fc.constant(undefined)).map(([base, search]) => {
    const url = new URL(base)
    if (search) {
      url.search = search?.toString()
    }
    return url
  })

export const request = ({
  headers,
  url,
}: { headers?: fc.Arbitrary<Headers>; url?: fc.Arbitrary<URL> } = {}): fc.Arbitrary<Request> =>
  fc
    .record({
      headers: headers ?? fc.constant({}),
      url: url ? url.map(String) : fc.webUrl(),
    })
    .map(createRequest)

export const response = (): fc.Arbitrary<Response> => fc.record({ req: request() }).map(createResponse)

export const connection = <S = H.StatusOpen>(...args: Parameters<typeof request>): fc.Arbitrary<ExpressConnection<S>> =>
  fc.tuple(request(...args), response()).map(args => new ExpressConnection(...args))

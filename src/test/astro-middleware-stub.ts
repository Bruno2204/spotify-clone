type AnyFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defineMiddleware = <T extends AnyFn>(fn: T): T => fn;

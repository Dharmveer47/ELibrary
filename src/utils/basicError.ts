/**
 * Catch any error that may occur in the given promise and return it as a
 * value in an array tuple. If the promise resolves, the first element of
 * the returned array tuple is undefined and the second element is the
 * resolved value.
 *
 * @param promise - The promise to be caught
 * @returns A tuple where the first element is undefined if the promise
 * resolves and the second element is the resolved value, or a tuple where
 * the first element is the error and the second element is undefined if the
 * promise rejects
 */
export function catchError<T>(
  promise: Promise<T>
): Promise<[undefined, T] | [Error]> {
  return promise
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((error) => {
      return [error];
    });
}

export function catchErrorTyped<T, E extends new (message?: string) => Error>(
  promise: Promise<T>,
  errorToCatch?: E[]
): Promise<[undefined, T] | [InstanceType<E>]> {
  return promise
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((error) => {
      if (errorToCatch === undefined) return [error];
      if(errorToCatch.some((E) => error instanceof E)) return [error];
      throw error;
    });
}

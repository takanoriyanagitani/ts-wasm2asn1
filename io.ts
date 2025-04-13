type IO<T> = () => Promise<T>;

function Bind<T, U>(
  io: IO<T>,
  mapper: (t: T) => IO<U>,
): IO<U> {
  return (): Promise<U> => {
    return Promise.resolve()
      .then((_) => io())
      .then((t: T) => mapper(t))
      .then((iu: IO<U>) => iu());
  };
}

const stdin2response: () => IO<Response> = (): IO<Response> => {
  return (): Promise<Response> => {
    return Promise.resolve(Deno.stdin.readable)
      .then((reader) => new Response(reader));
  };
};

function response2bytes(res: Response): IO<Uint8Array> {
  return (): Promise<Uint8Array> => {
    return Promise.resolve(res)
      .then((res) => res.bytes());
  };
}

type StdinToBytes = () => IO<Uint8Array>;

const stdin2bytes: StdinToBytes = (): IO<Uint8Array> => {
  return Bind(
    stdin2response(),
    response2bytes,
  );
};

type BytesToStdout = (bytes: Uint8Array) => IO<void>;

const bytes2stdout: BytesToStdout = (data: Uint8Array): IO<void> => {
  return (): Promise<void> => {
    return Promise.resolve(data)
      .then((dat) => Deno.stdout.write(dat))
      .then((_) => undefined);
  };
};

type FilenameToBytes = (filename: string) => IO<Uint8Array>;

const filename2bytes: FilenameToBytes = (filename: string): IO<Uint8Array> => {
  return (): Promise<Uint8Array> => {
    return Promise.resolve(filename)
      .then(Deno.readFile);
  };
};

function Lift<T, U>(pure: (t: T) => Promise<U>): (t: T) => IO<U> {
  return (t: T): IO<U> => {
    return (): Promise<U> => {
      return pure(t);
    };
  };
}

function Compose<T, U, V>(
  f: (t: T) => Promise<U>,
  g: (u: U) => Promise<V>,
): (t: T) => Promise<V> {
  return (t: T): Promise<V> => {
    const pu: Promise<U> = f(t);
    return pu.then(g);
  };
}

function Of<T>(t: T): IO<T> {
  return (): Promise<T> => {
    return Promise.resolve(t);
  };
}

export {
  Bind,
  bytes2stdout,
  type BytesToStdout,
  Compose,
  filename2bytes,
  type IO,
  Lift,
  Of,
  stdin2bytes,
};

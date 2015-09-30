AutoProxy2Pac
===========

A NodeJS clone of a removed project of [@clowwindy].

Translating Autoproxy list file to pac, providing fast / precise mode.

### Usage

    Usage: index [options]

    Options:

      -h, --help           output usage information
      -V, --version        output the version number
      -i, --input [path]   file path to the autoproxy file, an online download of g-f-w-list will happend if not given
      -o, --output [path]  file path to the generated pac, ./proxy.pac will be written is not given
      -p, --proxy <proxy>  proxy, required, for example: SOCKS 127.0.0.1:8080
      --precise            if generating a precise proxy pac according to Ad Block Plus implementation

[@clowwindy]: https://github.com/clowwindy
catbox-crypto
=============

Ephemeral encryption layer for [catbox](https://github.com/spumko/catbox) cache strategy engines.

Extends any `catbox` caching engine to automatically encrypt values stored in the cache using random keys.  Uses `catbox-memory` by default.

### Options

- `options` - a object with the following keys:
  - `algorithm` - cipher algorithm to use
    - Default: `'aes-128-cbc'`
    - see `$ openssl list-public-key-algorithms` for list of supported algorithms
  - `keySize` - cipher key size in bytes
    - Default: `16`
  - `ivSize` - cipher initialization vector size in bytes
    - Default: `16`
  - `engine` - is a string, object, or function detailing the [catbox](https://github.com/spumko/catbox) cache strategy to extend
    -  Default: `'catbox-memory'` 
    - see [catbox](https://github.com/spumko/catbox) [documentation](https://github.com/spumko/catbox/blob/master/README.md#client)
  - `engineOptions` - the cache strategy configuration object
    - see [catbox](https://github.com/spumko/catbox) [documentation](https://github.com/spumko/catbox/blob/master/README.md#client)

### Example
```
var Catbox = require('catbox');

var options = {
  algorithm: 'aes-256-cbc',
  keySize: 32,
  ivSize: 16,
  engine: 'catbox-memory',
  engineOptions: {
    maxByteSize: 209715200
  }
};

var client = new Catbox.Client('catbox-crypto', options);

var key = { 
  segment: 'test',
  id: 'test'
};

client.start(function () {
  client.set(key, 0xbeef, 1000, function (err) { ...  });
});
```

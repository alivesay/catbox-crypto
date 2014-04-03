catbox-crypto
=============

Ephemeral encryption layer for [catbox](https://github.com/spumko/catbox) cache strategy engines.


### Options

- `options` - a object with the following keys:
  - `algorithm` - encryption algorithm to use.  May be any available cipher algorithm name ( see `openssl list-public-key-algorithms`).  Default: `'aes-128-cbc`
  - `ivSize` - initialization vector size in bytes.  Default: `16`
  - `engine` - the [catbox](https://github.com/spumko/catbox) cache engine to use.
  - 
  

var assert = require('assert');
var Catbox = require('catbox');
var CatboxCrypto = require('..');

var options = {
  algorithm: 'aes-256-cbc',
  keySize: 32,
  ivSize: 16
};

describe('CatboxCrypto', function() {
  it('errors if not created with new', function () {
    assert.throws(CatboxCrypto, function (err) {
      return (err.message === 'Client must be instantiated with new');
    });
  });

  it('creates a new connection', function (done) {
    var client = new Catbox.Client(CatboxCrypto, options);
    client.start(function (err) {
      assert.equal(client.isReady(), true);
      done(err);
    });
  });

  describe('#set()', function () {
    it('should set the cache value without error', function (done) {
      var client = new Catbox.Client(CatboxCrypto, options);
      var key = { segment: 'test', id: 'test' };

      client.start(function () {
        client.set(key, 0xbeef, 5000, function (err) {
          if (err) { done(err); }
          assert.notEqual(client.connection.connection.cache[key.segment][key.id], undefined);
          done();
        });
      });
    });

    it('should error on null key', function (done) {
      var client = new Catbox.Client(CatboxCrypto, options);

      client.start(function () {
        client.set(null, 0xbeef, 5000, function (err) {
          assert.equal(err.message, 'Invalid key');
          done();
        });
      });
    });

    it('should error on invalid key', function (done) {
      var client = new Catbox.Client(CatboxCrypto, options);

      client.start(function () {
        client.set({}, 0xbeef, 5000, function (err) {
          assert.equal(err.message, 'Invalid key');
          done();
        });
      });
    });

    it('should error on circular reference', function (done) {
      var client = new Catbox.Client(CatboxCrypto, options);
      var key = { segment: 'test', id: 'test' };
      var value = { x: 1 };
      value.y = value;

      client.start(function () {
        client.set(key, value, 5000, function (err) {
          assert.equal(err.message, 'Converting circular structure to JSON');
          done();
        });
      });
    });
  });

  describe('#get()', function () {
    it('should get cached value after setting', function (done) {
      var client = new Catbox.Client(CatboxCrypto, options);
      var key = { segment: 'test', id: 'test' };

      client.start(function () {
        client.set(key, 0xbeef, 5000, function (err) {
          if (err) { done(err); }
          client.get(key, function (err, cached) {
            if (err) { done(err); }
            assert.equal(cached.item, 0xbeef);
            done();
          });
        });
      });
    });

    it('should return null when item not found', function (done) {
      var client = new Catbox.Client(CatboxCrypto, options);
      var key = { segment: 'test', id: 'test' };

      client.start(function () {
        client.get(key, function (err, cached) {
          assert.equal(err, null);
          assert.equal(cached, null);
          done();
        });
      });
    });
  });

  it('should return null when item is expired', function (done) {
    var client = new Catbox.Client(CatboxCrypto, options);
    var key = { segment: 'test', id: 'test' };

    client.start(function () {
      client.set(key, 0xbeef, 1, function (err) {
        if (err) { done(err); }
        setTimeout(function () {
          client.get(key, function (err, cached) {
            assert.equal(err, null);
            assert.equal(err, cached);
            done();
          });
        }, 2);
      });
    });
  });

  describe('#drop()', function () {
    it('should drop cached item without error', function (done) {
      var client = new Catbox.Client(CatboxCrypto, options);
      var key = { segment: 'test', id: 'test' };

      client.start(function () {
        client.set(key, 0xbeef, 5000, function (err) {
          if (err) { done(err); }
          client.drop(key, done);
        });
      });
    });

    it('should error when dropping invalid key', function (done) {
      var client = new Catbox.Client(CatboxCrypto, options);
      var key = { segment: 'test', id: 'test' };

      client.start(function () {
        client.set(key, 0xbeef, 5000, function (err) {
          if (err) { done(err); }
          client.drop(null, function (err) {
            assert(err.message === 'Invalid key');
            done();
          });
        });
      });
    });
  });

});
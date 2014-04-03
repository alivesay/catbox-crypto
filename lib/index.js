var crypto = require('crypto');
var randomEnoughBytes = require('random-enough');
var Buffer = require('buffer').Buffer;
var Hoek = require('Hoek');


var internals = {};

internals.defaults = {
  algorithm: 'aes-128-cbc',
  ivSize: 16,
  engine: 'catbox-memory',
  engineOptions: {}
};


exports = module.exports = internals.Connection = function (options) {
  Hoek.assert(this !== undefined && this.constructor === internals.Connection, 'Client must be instantiated with new');

  this.settings = Hoek.applyToDefaults(internals.defaults, options || {});

  this.settings.key = randomEnoughBytes(this.settings.ivSize);

  if (typeof this.settings.engine === 'string') {
    var Connection = require(this.settings.engine);
    this.connection = new Connection(this.settings.engineOptions);
  }
  else if (typeof this.settings.engine === 'object') {
    this.connection = this.settings.engine;
  }
  else if (typeof this.settings.engine === 'function') {
    this.connection = new this.settings.engine(this.settings.engineOptions);
  }

  Hoek.assert(this.connection, 'Invalid engine configuration');
};


internals.Connection.prototype.start = function (callback) {
  return this.connection.start(callback);
};


internals.Connection.prototype.stop = function () {
  this.connection.stop();
};


internals.Connection.prototype.isReady = function () {
  return this.connection.isReady();
};


internals.Connection.prototype.validateSegmentName = function (name) {
  return this.connection.validateSegmentName(name);
};


internals.Connection.prototype.get = function (key, callback) {
  var self = this;

  this.connection.get(key, function (err, cached) {
    if (err) {
      return callback(err, null);
    }

    if (!cached) {
      return callback(null, null);
    }

    var decipher = crypto.createDecipheriv(self.settings.algorithm, self.settings.key, new Buffer(cached.item.iv));
    cached.item = JSON.parse(decipher.update(cached.item.cipherText, 'hex', 'utf8') + decipher.final('utf8'));

    return callback(null, cached);
  });
};


internals.Connection.prototype.set = function (key, value, ttl, callback) {
  var self = this;

  randomEnoughBytes(this.settings.ivSize, function (err, iv) {
    var cipher = crypto.createCipheriv(self.settings.algorithm, self.settings.key, iv);
    var stringifiedValue = null;

    try {
      stringifiedValue = JSON.stringify(value);
    } catch (e) {
      return callback(e);
    }

    var crypted = {
      cipherText: cipher.update(stringifiedValue, 'utf8', 'hex') + cipher.final('hex'),
      iv: iv
    };

    return self.connection.set(key, crypted, ttl, callback);
  });
};


internals.Connection.prototype.drop = function (key, callback) {
  return this.connection.drop(key, callback);
};
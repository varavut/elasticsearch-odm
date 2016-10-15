'use-strict'

var requireNew = require('require-new'),
  app = requireNew('../index'),
  _ = require('lodash'),
  should = require('should'),
  helper = require('./helper')

var Car = app.model('Car')

describe('Query-And-Update', function () {
  before(function (done) {
    this.timeout(10000)
    helper.connect(app)
      .then(function () {
        return new Car({ name: 'Ford', speed: 0 }).save()
      })
      .then(function () {
        return new Car({ name: 'Chevrolet', speed: 5 }).save()
      })
      .then(function () {
        return new Car({ name: 'Honda', speed: 10 }).save()
      })
      .then(function () {
        return new Car({ name: 'Lexus', speed: 15 }).save()
      })
      .then(function () {
        // force index refresh
        return helper.refresh(app)
      })
      .then(function () {
        done()
      })
      .catch(done)
  })

  after(function (done) {
    this.timeout(10000)
    console.log('deleting')
    helper.remove(app)
      .then(function () {
        done()
      })
      .catch(done)
  })

  it('.findAndUpdate() with match and empty option', function (done) {
    Car.findAndUpdate({name: 'Ford'}, null, {speed: 50}).then(function (res) {
      res.total.should.be.eql(1)
      res.updated.should.be.eql(1)
      res.failures.should.be.instanceof(Array)
      res.failures.should.be.empty()
      Car.findOne({name: 'Ford'}).then(function (ford) {
        ford.speed.should.be.eql(50)
        done()
      }).catch(done)
    }).catch(done)
  })

  it('.findAndUpdate() with option', function (done) {
    Car.findAndUpdate({}, {
      must: {
        name: 'Honda'
      }
    }, {speed: 50}).then(function (res) {
      res.total.should.be.eql(1)
      res.updated.should.be.eql(1)
      res.failures.should.be.instanceof(Array)
      res.failures.should.be.empty()
      Car.findOne({name: 'Honda'}).then(function (honda) {
        honda.speed.should.be.eql(50)
        done()
      }).catch(done)
    }).catch(done)
  })

  it('.findAndUpdate() all docs', function (done) {
    Car.findAndUpdate({}, null, {speed: 50}).then(function (res) {
      res.total.should.be.eql(4)
      res.updated.should.be.eql(4)
      res.failures.should.be.instanceof(Array)
      res.failures.should.be.empty()
      Car.find({}).then(function (cars) {
        _.each(cars, (car) => {
          car.speed.should.be.eql(50)
        })
        done()
      }).catch(done)
    }).catch(done)
  })
})

'use-strict'

var requireNew = require('require-new'),
  app = requireNew('../index'),
  _ = require('lodash'),
  should = require('should'),
  helper = require('./helper')

var Car = app.model('Car')

describe('Query-Promise-Range', function () {
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

  it('.findOne() with range option query', function (done) {
    var start = 2
    var end = 6
    Car.findOne({}, {
      range: {
        speed: {
          gte: start,
          lte: end
        }
      }
    }).then(function (res) {
      res.should.be.instanceof(Object)
      res.should.not.be.empty()
      res.speed.should.be.within(start, end)
      done()
    }).catch(done)
  })

  it('.findOne() with notInRange option query', function (done) {
    var start = 2
    var end = 6
    Car.findOne({}, {
      notInRange: {
        speed: {
          gte: start,
          lte: end
        }
      }
    }).then(function (res) {
      res.should.be.instanceof(Object)
      res.should.not.be.empty()
      res.speed.should.not.be.within(start, end)
      done()
    }).catch(done)
  })

  it('.findOne() with range and notInRange option query', function (done) {
    var start = 1
    var end = 14
    var startNot = 2
    var endNot = 6
    Car.findOne({}, {
      range: {
        speed: {
          gte: start,
          lte: end
        }
      },
      notInRange: {
        speed: {
          gte: startNot,
          lte: endNot
        }
      }
    }).then(function (res) {
      res.should.be.instanceof(Object)
      res.should.not.be.empty()
      res.speed.should.be.within(start, end)
      res.speed.should.not.be.within(startNot, endNot)
      done()
    }).catch(done)
  })

  it('.find() and .range() query', function (done) {
    var start = 2
    var end = 11
    Car.find().range({
      speed: {
        gte: start,
        lte: end
      }
    }).then(function (res) {
      res.should.be.instanceof(Array)
      res.should.not.be.empty()
      res.should.have.length(2)
      _.each(res, (car) => {
        car.speed.should.be.within(start, end)
      })
      done()
    }).catch(done)
  })

  it('.find() and .notInRange() query', function (done) {
    var start = 2
    var end = 11
    Car.find().notInRange({
      speed: {
        gte: start,
        lte: end
      }
    }).then(function (res) {
      res.should.be.instanceof(Array)
      res.should.not.be.empty()
      res.should.have.length(2)
      _.each(res, (car) => {
        car.speed.should.not.be.within(start, end)
      })
      done()
    }).catch(done)
  })

  it('.find() and .range() .notInRange() query', function (done) {
    var start = 1
    var end = 14
    var startNot = 2
    var endNot = 6
    Car.find().range({
      speed: {
        gte: start,
        lte: end
      }
    }).notInRange({
      speed: {
        gte: startNot,
        lte: endNot
      }
    }).then(function (res) {
      res.should.be.instanceof(Array)
      res.should.not.be.empty()
      res.should.have.length(1)
      _.each(res, (car) => {
        car.speed.should.be.within(start, end)
        car.speed.should.not.be.within(startNot, endNot)
      })
      done()
    }).catch(done)
  })
})

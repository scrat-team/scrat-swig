'use strict';

var expect = require('expect.js');
var Mock = require('mockjs');
var Resource = require('../../lib/resource');

describe('Lib: resource', function() {
  describe('genComboURI', function() {
    var resource;
    var mockData;
    beforeEach(function() {
      resource = new Resource({});
      mockData = Mock.mock({
        'scripts|10': ['0_@string(lower, 10)'],
        'scripts2|10': ['-2_@string(lower, 10)'],
        'scripts3|10': ['3_@string(lower, 10)']
      });
      mockData.mapping = {};
      mockData.scripts.forEach(function(item) {
        mockData.mapping[item] = 0;
      });
      mockData.scripts2.forEach(function(item) {
        mockData.mapping[item] = -2;
      });
      mockData.scripts3.forEach(function(item) {
        mockData.mapping[item] = 3;
      });
    });

    it('should return only one url', function() {
      var result = resource.genComboURI(mockData.scripts, mockData.mapping);
      expect(result.length).to.equal(134);
    });

    it('should return multi url', function() {
      resource.maxUrlLength = 90;
      var result = resource.genComboURI(mockData.scripts, mockData.mapping);
      expect(result.length).to.equal(134);
    });

    // it('should return group', function() {
    //  resource.maxUrlLength = 90;
    //  var result = resource.genComboURI([].concat(mockData.scripts, mockData.scripts2, mockData.scripts3), mockData.mapping);
    //  expect(result.length).to.equal(6);
    //  expect(result[0]).to.match(/-2_/);
    //  expect(result[2]).to.match(/0_/);
    //  expect(result[4]).to.match(/3_/);
    // });
  });
});

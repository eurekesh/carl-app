var assert= require('chai').assert;
var thefile= require('../public/res/js/canmancopy');


describe('practicehello', function(){
    it('should return hello', function(){
        let result=thefile().hello;
        assert.equal(result, "hello");
    });
});
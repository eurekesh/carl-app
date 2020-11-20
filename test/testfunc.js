var assert= require('chai').assert;
//cont fileImtesting= require('../../../yggdrasil').functionimTesting;
const thefile= require('../public/res/js/canvas_manager');


describe('practicehello', function(){
    it('should return hello', function(){
        let result=thefile();
        assert.equal(result, "hello");
    });
});
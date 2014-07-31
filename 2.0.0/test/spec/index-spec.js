KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('digitalscroll', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','kg/digitalscroll/2.0.0/']});
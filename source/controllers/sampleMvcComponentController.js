define([], function() {

    function SampleMvcController(element, config) {

        this.clickHappened = function() {
            alert(this.model.test);
        };
    }

    return SampleMvcController;
});
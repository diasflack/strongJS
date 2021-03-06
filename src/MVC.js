(function(global) {

    "use strict";

    var global = global;

    /** @namespace MVC */
    var MVC = global.MVC || {};


    MVC.PubSub = (function() {

        var events = {};
        var hOp = events.hasOwnProperty;

        return {
            subscribe: function(event, listener) {

                if (!hOp.call(events, event)) {
                    events[event] = [];
                }

                var index = events[event].push(listener) - 1;

                return {
                    remove: function() {
                        delete events[event][index];
                    }
                }

            },

            publish: function(event, info) {
                if(!hOp.call(events, event)) {
                    return;
                }

                events[event].forEach(function(item) {
                    item(info != undefined ? info : {});
                });
            }

        }

    })();

    MVC.Model = function(ModelMap) {

        return function() {

            var that = this;

            for (var property in ModelMap) {

                var privateProperty = "_"+property;
                that[privateProperty] = ModelMap[property];

                Object.defineProperty(that, property, {
                    get: function(privateProperty) {
                        return function() {
                            return that[privateProperty];
                        };
                    }(privateProperty),

                    set: function (privateProperty) {
                        var typeOfVal, typeOfProperty;
                        return function(val) {

                            typeOfProperty = Array.isArray(that[privateProperty]) ? "Array" : typeof that[privateProperty];
                            typeOfVal = Array.isArray(val) ? "Array" : typeof val;

                            if (typeOfProperty === typeOfVal) {
                                that[privateProperty] = val;
                            } else {
                                throw new Error("Wrong type! Must be "+ typeOfProperty +" - but got "+ typeOfVal);
                            }
                        };
                    }(privateProperty),

                    configurable: false});
            }

            Object.preventExtensions(that);
            MVC.PubSub.publish("modelCreated", that);

        };
    };

    MVC.ModelList = function(ModelConstructor) {
        var that = this;
        that.modelConstructor = ModelConstructor || [];
        that.models = [];

        MVC.PubSub.subscribe("modelCreated", function(model) {
            if(model instanceof that.modelConstructor) {
                that.addModel(model);
            }
        });

    };

    MVC.ModelList.prototype.addModel = function(model) {
        this.models.push(model);
    };

    MVC.ModelList.prototype.getModels = function() {
        return this.models;
    };

    MVC.Controller = function(model, view) {

    };

    /**
     *
     * MVC View
     *
     * @param {object} settings
     * @param settings.model - model that must be represented
     * @param settings.element - ID of DOM element
     *
     * @constructor
     * @memberof MVC
     */
    MVC.View = function(settings) {
        if (!settings.model) {
            throw new Error("Model must be defined!");
        }

        if (!settings.element) {
            throw new Error("Element must be defined!");
        }

        this.model = settings.model;
        this.element = document.getElementById(settings.element);
        this.template = settings.template ? settings.template : this.element.innerHTML;

    };

    MVC.View.prototype.render = function(){
        console.log(this);
    };

    global.MVC = MVC;

})(window);
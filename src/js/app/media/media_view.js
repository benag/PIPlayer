/*
 * the media view
 *
 */

define(['jquery', 'backbone','app/task/main_view'], function($, Backbone,main_view){

    var canvas = main_view.$el;

    var View = Backbone.View.extend({

        // build element according to simulus
        initialize: function(){

            this.$el
                .addClass('stimulus')
                .attr('data-handle', this.model.handle)     // add data-handle for handeling of mouse/touch interactions
                .css("visibility", "hidden")
                .css(this.model.get('css'))
                .appendTo(canvas);

            this.render();
        },

        // we keep all stimuli appended to the canvas so that the render function can apply to them
        // they shouldn't affect each other because they have absolute positioning
        // we hide and show them using visibility

        render: function(){
            // these are the things that need recalibrating on refresh
            this.size();
            this.place();
            return this;
        },

        show: function(){
            this.$el.css("visibility", "visible");
            return this;
        },

        hide: function(){
            this.$el.css("visibility", "hidden");
            return this;
        },

        size: function(){
            var size = this.model.get('size');
            if (size.height != 'auto') {
                this.$el.height(size.height + '%');
            }
            if (size.width != 'auto'){
                this.$el.width(size.width + '%');
            }
            if (size.font_size){
                this.$el.css('font-size', size.font_size);
            }
        },

        // places the element on the canvas (has to be called after size)
        // @TODO: this is way too complex to be left here, we should probably export this to a seperate file or something
        place: function(){
            // helper function: returns sizes of element;
            function size($elem){
                return {
                    height    : $elem.outerHeight(),
                    width    : $elem.outerWidth()
                };
            }

            var top, bottom, left, right; // will hold the offset for the locations
            var canvasSize = size(canvas);
            var elSize = size(this.$el);
            // get location setting and set center as default
            var location = this.model.get('location') || {};
            if (typeof location.top == 'undefined' && typeof location.bottom == 'undefined') {
                location.top = 'center';
            }
            if (typeof location.left == 'undefined' && typeof location.right == 'undefined') {
                location.right = 'center';
            }

            // set offsets:
            switch (location.top){
                case undefined :
                    /* falls through */
                case 'auto'     : top = 'auto'; break;
                case 'center'    : top = (canvasSize.height - elSize.height)/2; break;
                default            : top = (canvasSize.height * location.top)/100;
            }

            switch (location.bottom){
                case undefined :
                    /* falls through */
                case 'auto'     : bottom = 'auto'; break;
                case 'center'    : bottom = (canvasSize.height - elSize.height)/2; break;
                default            : bottom = (canvasSize.height * (location.bottom))/100;
            }

            switch (location.left){
                case undefined :
                    /* falls through */
                case 'auto'     : left = 'auto'; break;
                case 'center'    : left = (canvasSize.width - elSize.width)/2; break;
                default            : left = (canvasSize.width * location.left)/100;
            }

            switch (location.right){
                case undefined :
                    /* falls through */
                case 'auto'     : right = 'auto'; break;
                case 'center'    : right = (canvasSize.width - elSize.width)/2; break;
                default            : right = (canvasSize.width * (location.right))/100;
            }

            this.$el.css({
                top     : top,
                bottom    : bottom,
                left     : left,
                right     : right
            });
        }

    });

    // Returns the View Constructor
    return View;
});
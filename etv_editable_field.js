(function($) {
    $.fn.extend({

        blink: function(options) {
            var settings = {
                maxBlinks: undefined,
                blinkPeriod: 1000,
                onMaxBlinks: function() {},
                onBlink: function(i) {},
                speed: undefined
            };

            if (options) {
                $.extend(settings, options);
            }
            var blinkElem = this;
            var on = true;
            var blinkCount = 0;
            settings.speed = settings.speed ? settings.speed: settings.blinkPeriod / 2;

            (function toggleFade() {
                var maxBlinksReached = false;
                if (on) {
                    blinkElem.fadeTo(settings.speed, 0.01);
                } else {
                    blinkCount++;
                    maxBlinksReached = (settings.maxBlinks && (blinkCount >= settings.maxBlinks));
                    blinkElem.fadeTo(settings.speed, 1,
                    function() {
                        settings.onBlink.call(blinkElem, blinkCount);
                        if (maxBlinksReached) {
                            settings.onMaxBlinks.call();
                        }
                    });
                }
                on = !on;
                if (!maxBlinksReached) {
                    setTimeout(toggleFade, settings.blinkPeriod / 2);
                }
            })();
            return this;
        },




        makeEditable: function(options) {

            //Settings list and the default values
            var defaults = {
                editableInput: '.fieldInput',
                editableButtonClass: '.fieldsButton'
            };

            var options = $.extend(defaults, options);



            // COMMENT FORM OBJECT
            comment_obj = $('#comment_window')

            //initialise fields to comment form
            comment_obj.text_field = undefined
            comment_obj.communication = undefined



            //blinking method
            comment_obj.warning_blink = function() {
                comment_obj.css({
                    'border-color': 'red'
                })
                comment_obj.blink({
                    blinkPeriod: 500,
                    maxBlinks: 3,
                    onMaxBlinks: function() {
                        comment_obj.css({
                            'border': '1px solid #EEE'
                        })
                    }
                })
            }


            //method read to read fields values
            comment_obj.fields = {}
            comment_obj.read = function() {
                comment_obj.fields.comment = comment_obj.find('textarea').attr('value')
                comment_obj.fields.communication = comment_obj.find('#id_communication').val()
            }


            // is_valid method for comment window fields,  return true if valid otherwise false
            comment_obj.is_valid = function(raise) {
                comment_obj.read()
                valid = true
                if (!comment_obj.fields.comment & raise) {
                    valid = false
                    //alert("Please vedite commentatij k izmeneniyam")
                    $('.error').html('vvedite commentarij k izmeneniyam please')
                    $('.error').css({'display':'block'})
                    comment_obj.warning_blink()
                } else { 
                    $('.error').css({'display':'none'}) 
                    }
                if (!raise){
                    valid = true 
                }
                return valid
            }


            // bind keypress to read values every time key pressed on textarea
            comment_obj.find('textarea').bind('keypress',
            function() {
                comment_obj.read()
            })

            // bind read comment every time type of communication changed
            comment_obj.find('select').bind('change',
            function() {
                comment_obj.read()
            })

            // END COMMENT OBJECT

            return this.each(function() {
                var op = options;

                //Assign current element to variable, in our case element is a link wich is connected to a few ore one fields
                // by same class ending id.... Example: 'editButton_1' could be connected to fields editInput_1 and edditOptionsInput_1
                // in other words: one obj represents class with a attributes fields connected to it...
                var obj = $(this);



                //initialise fields attributes in obj
                obj.clean_obj = function() {
                    obj.fields = []
                    obj.fields_obj = {}
                    obj.fields_val = {}
                    obj.is_opend = false
                    obj.changed = false
                }
                obj.clean_obj()

                //get url
                obj.url = obj.attr('href')

                //icons objects
                obj.icon = obj.html()
                obj.loader = {}
                obj.loader.state = 'off'
                obj.loader['html'] = '<img src="http://dl.dropbox.com/u/15842180/statick/load.gif">'



                // get edit_id
                var edit_id = obj.attr('class').split('_')[1]
                var related_imputs = $('.editInput_' + edit_id)
                var related_option_fields = $('.editOptions_' + edit_id)



                obj.lock_fields = function() {
                    $(obj.fields).each(function(index, name) {
                        field = obj.fields_obj[name]
                        field.css({'display':'inline'})
                        if (field.field_type == 'input') {
                            text = field.find('input').attr('value')
                            field.find('input').css({
                                'display': 'none'
                            })
                            field.prepend("<div class='input_text' style='display:inline'>" + text + "</div>")
                        }

                        if (field.field_type == 'select') {
                            var text = field.find("select option:selected").text()
                            field.find('select').css({
                                'display': 'none'
                            })
                            field.prepend("<div class='selected_text' style='display:inline'>" + text + "</div>")
                        }
                        obj.is_opend = false

                    })
                }





                obj.unlock_fields = function() {
                    $(obj.fields).each(function(index, name) {
                        field = obj.fields_obj[name]
                        if (field.field_type == 'input') {
                            field.find('.input_text').remove()
                            field.find('input').css({
                                'display': 'inline'
                            })
                        }

                        if (field.field_type == 'select') {
                            field.find('.selected_text').remove()
                            field.find('select').css({
                                'display': 'inline'
                            })
                        }
                        obj.is_opend = true
                    })
                }



                obj.togle_lock = function() {
                    if (this.is_opend) {
                        this.obj.lock_fields()
                    } else {
                        this.obj.unlock_fields()
                    }
                }




                //method to togle obj loader
                obj.toggle_loader = function() {
                    if (obj.loader.state == 'off') {
                        obj.html(obj.loader['html'])
                        obj.loader.state = 'on'
                    } else {
                        obj.html(obj.icon)
                        obj.loader.state = 'off'
                    }
                }





                //obj method to get fields and values for each field
                obj.read_fields = function() {
                    self = this

                    //get values from INPUT fields if present
                    related_imputs.each(function(item, o) {

                        var o = $(o)

                        //method of field that reeds value from input
                        o.readmyself = function() {
                            obj.fields_val[name] = o.find('input').attr('value')
                        }


                        o.field_type = 'input'
                        //get current field name
                        var name = o.find('input').attr('name')

                        //get curent value
                        var val = o.find('input').attr('value')


                        //bind keypress for this field input so when user hit enter it sends data to the server
                        o.bind('keypress',
                        function(e) {
                            if (e.keyCode == 13) {
                                obj.click()
                            } else {
                                o.readmyself()
                                obj.changed = true
                            }
                        })

                        // save list of fields
                        obj.fields.push(name)

                        //save curent values of fields
                        obj.fields_val[name] = val
                        // save fields jquery objects
                        obj.fields_obj[name] = o
                    })



                    //get values from OPTIONS fields if present
                    related_option_fields.each(function(index, o) {
                        var o = $(o)

                        o.field_type = 'select'


                        var name = o.find('select').attr('name')
                        var val = o.find('select').attr('value')
                        // method to read values from field
                        o.readmyself = function() {
                            var o_val = this.find('select').attr('value')
                            obj.fields_val[name] = o_val
                            return o_val
                        }

                        //bind function to capture values of choice field when changes made
                        o.find('select').bind('change',
                        function(item) {
                            o.readmyself()
                            obj.changed = true
                        })


                        o.readmyself()
                        obj.fields.push(name)
                        obj.fields_obj[name] = o
                    })


                }


                //method save to save object on the server
                obj.save = function() {
                    obj.saved = true
                    data = {}
                    $.extend(data, this.fields_val, comment_obj.fields)
                    self = this
                    if (self.changed) {
                        $.ajax({
                            type: 'POST',
                            beforeSend: function() {
                                self.toggle_loader()
                            },
                            url: this.url,
                            data: data,
                            success: function(resp) {
                                
                                self.toggle_loader()
                            },
                            dataType: 'JSON',
                            error: function(){
                                obj.saved = false
                            }
                        })
                    }
                    return 
                }



                //bind click for editButton class
                obj.click(function(e) {
                    e.preventDefault()

                    if (obj.is_opend) {

                        if (comment_obj.is_valid(obj.changed) || !obj.changed) {
                            $(obj.fields).each(function(index, name) {
                                obj.fields_obj[name].readmyself()
                            })

                            obj.lock_fields()
                            obj.save()
                        }

                    } else {

                        obj.unlock_fields()
                        obj.fields_obj[obj.fields[0]].find('input').focus()
                    }


                })

                obj.read_fields()
                obj.lock_fields()


            });
        }
    });

    $(document).ready(function() {
        $('a[class^=editButton]').makeEditable()
    })



})(django.jQuery);

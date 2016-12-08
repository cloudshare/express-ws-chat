(function () {
    var ROOM = "237";
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side, this.sender = arg.username;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                console.log("Displaying ", _this);
                $message.find('.avatar').html(_this.sender);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };

    var displayMessage = function(text, left, sender ) {
        var $messages, message;
        if (text.trim() === '') {
            return;
        }
        $('#message_input').val('');
        $messages = $('.messages');
        message_side = left ? 'left' : 'right';
        message = new Message({
            text: text,
            message_side: message_side,
            username: sender
        });
        message.draw();
        return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
    };

    var on_history = function(response) {
        response.messages.forEach(function(msg) {
            displayMessage(msg.msg, true, msg.user);
        });
        console.log("history response", response);
    }

    $(function () {
        $(".chat_window").hide();
        getAlias = function () {
            return $('#alias_input').val();
        };

        $('#enter_room').click(function (e) {
            enter(getAlias());
        });
        $('#alias_input').keyup(function (e) {
            if (e.which === 13) {
                enter(getAlias());
            }
        });


        var enter = function(user) {
            $(".alias_window").hide();
            $(".chat_window").show();
            $("#message_input").focus();

            getMessageText = function () {
                var $message_input;
                $message_input = $('#message_input');
                return $message_input.val();
            };

            var webSocket = $.simpleWebSocket({ url: 'ws://' + location.hostname + '/room/' + ROOM });

            send = function(msg) {
                webSocket.send({ user: user, message: msg});
            }
            // reconnected listening
            webSocket.listen(function(message) {
                if (message.message == "_whois_") {
                    $.get("/api/history/" + ROOM)
                        .done(on_history)
                        .always(function() { send("_announce_"); });
                } else {
                    displayMessage(message.message, true, message.user);
                }
            });


            say = function(msg) {
                if (!msg) {
                    msg = getMessageText();
                }
                send(msg);
                displayMessage(msg, false, user);
            };

            $('#send_message').click(function (e) {
                say();
            });
            $('#message_input').keyup(function (e) {
                if (e.which === 13) {
                    say();
                }
            });
        };


    });
}.call(this));

(function () {
    'use strict';

    var element = function (id) {
        return document.getElementsByName(id);
    }
    var messages = document.getElementById('messages');
    var status = document.getElementById('status');
    var userMessage = element('message');
    var clearBtn = document.getElementById('clear');
    var chatForm = document.getElementById('chat-form')

    var statusDefault = status.textContent;

    var setStatus = function (s) {
        status.textContent = s;

        if (s !== statusDefault) {
            var delay = setTimeout(function () {
                setStatus(statusDefault);
            }, 4000);
        }
    }
    var socket = io.connect('http://localhost:8000');
    if (socket !== undefined) {
        console.log('Connected to socket...');
        socket.on('output', function (data) {
            if (data.length) {
                for (var x = 0; x < data.length; x++) {
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name + ": " + data[x].message;
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);
                }
            }
        });

        socket.on('status', function (data) {
            setStatus((typeof data === 'object') ? data.message : data);

            if (data.clear) {
                userMessage.value = '';
            }
        });

        chatForm.addEventListener('submit', function (event) {
            event.preventDefault();
            let subUsr = event.target.elements.username.value
            subUsr = subUsr.trim()
            let subMsg = event.target.elements.userMessage.value
            subMsg = subMsg.trim()
            var clickData = {
                name: subUsr,
                message: subMsg
            }
            socket.emit('input', clickData);
            console.log(clickData)
            event.target.elements.username.value = ''
            event.target.elements.userMessage.value = ''
            event.target.elements.username.focus();
            event.target.elements.userMessage.focus();
        })
        clearBtn.addEventListener('click', function () {
            socket.emit('clear');
        });
        socket.on('cleared', function () {
            messages.textContent = '';
        });
    }
})();

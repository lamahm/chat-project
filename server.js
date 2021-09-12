const express = require("express");

const app = express()

const http = require("http").Server(app)

const mongo = require('mongodb').MongoClient;

const io = require('socket.io')(http);

var router = express.Router();

var path = require('path');

const routerIndexGet = router.get('/', function(req, res, next) {
    res.render('index')
});

const routerIndexPost = router.post('/', function(req, res, next) {
    res.redirect('/')
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use("/static", express.static('./static/'));

mongo.connect('mongodb://localhost/chatdb', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    io.sockets.on('connection', function(socket){
        let chat = db.collection('chats');
        console.log('socket connected')

        sendStatus = function(s){
            socket.emit('status', s);
        }
        
        chat.find().limit(100).sort({_id:-1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            socket.emit('output', res);
        });

        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            if(name == '' || message == ''){
                sendStatus('Please enter a name and message');
            } else {
                let insertData = {
                    name: name, 
                    message: message
                }
                chat.insert(insertData, function(){
                    io.sockets.emit('output', [data]);

                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        socket.on('clear', function(data){
            chat.remove({}, function(){
                socket.emit('cleared');
            });
        });
    });
});

app.use('/', routerIndexGet);
app.use('/', routerIndexPost);

http.listen(8000, ()=>{
console.log("connected to port: "+ 8000)
});
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, send, emit, leave_room
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room = db.Column(db.String(40))
    message = db.Column(db.String(200))
    dtime = db.Column(db.DateTime)
    gif = db.Column(db.String())

    def __init__(self, room, message, dtime, gif):
        self.room = room
        self.message = message
        self.dtime = dtime
        self.gif = gif

    def __repr__(self):
        return f"{self.room} - {self.message}"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    room = request.form['room']
    print(room, flush=True)
    msg_list = Message.query.filter_by(
        room="Python").order_by(Message.dtime.desc()).limit(4)
    msg_list = msg_list[::-1]
    print(msg_list)
    return render_template("chat.html", room=room, messages=msg_list)


@socketio.on("join_room_event")
def join_room_handler(data):
    room = data['room']
    # app.logger.info(data)
    join_room(data['room'])
    emit("join_room_broadcast", data, broadcast=True, room=room)


@socketio.on("send_message")
def message_handler(data):
    print(f"{len(data['gif'])} image")
    # add data to database and other stuff
    _message = Message(room=data["room"],
                       message=data['message'], dtime=datetime.now(), gif=data["gif"])
    db.session.add(_message)
    db.session.commit()
    emit("recieve_message", data, room=data["room"])


if __name__ == "__main__":
    socketio.run(app, debug=True)

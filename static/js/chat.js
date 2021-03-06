var socket = io({ transports: ["websocket"] });
var image = "";
const roomData = document.querySelector(".navbar").dataset.room;
console.log(roomData);
socket.on("connect", function () {
  console.log("Joined!");
  socket.emit("join_room_event", {
    room: roomData,
  });
});

let vid2 = document.querySelector("#vid");
navigator.mediaDevices
  .getUserMedia({
    video: { facingMode: "user" },
  })
  .then((stream) => {
    vid2.srcObject = stream;
    vid2.onloadedmetadata = function (e) {
      vid2.play(e);
    };
  });

let progressBar = document.querySelector("progress");

socket.on("join_room_broadcast", function (data) {
  console.log(`Room name -${roomData}`);
});
const messageInputForm = document.querySelector(".message-input-form");
const messageInput = document.querySelector(".message-input");

socket.on("recieve_message", function (data) {
  let messageContainer = document.createElement("div");
  messageContainer.classList.add("message");
  let gifContainer = document.createElement("div");
  gifContainer.classList.add("gif");
  let gif = document.createElement("img");
  gif.style.width = "150px";
  gif.setAttribute("src", data["gif"]);
  gif.setAttribute("alt", "Some error occured for this gif");
  gifContainer.appendChild(gif);
  messageContainer.appendChild(gifContainer);
  let messageTextContainer = document.createElement("div");
  messageTextContainer.classList.add("message-container");
  let text = document.createElement("div");
  text.classList.add("text");
  text.textContent = data["message"];
  messageTextContainer.appendChild(text);
  messageContainer.appendChild(messageTextContainer);
  let messages = document.querySelector(".messages");
  messages.appendChild(messageContainer);
  messageInput.scrollIntoView({
    behaviour: "smooth",
  });
});

messageInputForm.onsubmit = function (e) {
  e.preventDefault();
  let messages = document.querySelector(".messages");
  let message = messageInput.value;
  if (message.length) {
    gifshot.createGIF(
      {
        gifWidth: 150,
        gifHeight: 150,
        interval: 0.1,
        numFrames: 10,
        frameDuration: 1,
        fontWeight: "normal",
        fontSize: "16px",
        fontFamily: "sans-serif",
        fontColor: "#ffffff",
        textAlign: "center",
        textBaseline: "bottom",
        sampleInterval: 10,
        numWorkers: 2,
        progressCallback: function (captureProgress) {
          progressBar.classList.remove("hidden");
          progressBar.value = captureProgress;
        },
      },
      function (obj) {
        if (!obj.error) {
          console.log(`0th ${image.length}`);
          image = obj.image;
          progressBar.classList.add("hidden");
          progressBar.value = 0;
          console.log(`1st ${image.length}`);
          socket.emit("send_message", {
            room: roomData,
            message: message,
            gif: image,
          });

          messageInput.value = "";
          messageInput.focus();
        }
      }
    );
  }
};

const socket = io();

// Elements
const $chatFrom = document.querySelector("form");
const $location = document.querySelector("#locationButton");
const $sendButton = document.querySelector("#sendButton");
const $formInput = document.querySelector("input");
const $message = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Query String
const { user_name, room_name } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Automatic scrolling
const autoScroll = () => {
  // New message element
  const $newMessage = $message.lastElementChild;
  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  //visible height
  const visibleHeight = $message.offsetHeight;
  //height of the message container
  const containerHeight = $message.scrollHeight;
  // how far scrolled?
  const scrollOffset = $message.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrollOffset){
    $message.scrollTop = $message.scrollHeight
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    user_name: message.user_name,
    message: message.text,
    createdAt: moment(message.createdAt).format("hh:mm a"),
  });
  $message.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (url) => {
  const html = Mustache.render(locationTemplate, {
    user_name: url.user_name,
    url: url.locationUrl,
    createdAt: moment(url.createdAt).format("hh:mm a"),
  });
  $message.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room_name, user_list }) => {
  const html = Mustache.render(sidebarTemplate, {
    room_name: room_name.toUpperCase(),
    user_list,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$chatFrom.addEventListener("submit", (e) => {
  e.preventDefault();
  $sendButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.msg.value;
  socket.emit("sendMessage", message, (ack) => {
    $sendButton.removeAttribute("disabled");
    $formInput.value = "";
    $formInput.focus();
    if (ack) {
      return ack
    }
  });
});

$location.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geo Loction is not supported.");
  }
  $location.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit(
        "sendLocation",
        {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        },
        (location) => {
          $location.removeAttribute("disabled");
        }
      );
    },
    (error) => {
      console.log(error);
    }
  );
});

socket.emit("join", { user_name, room_name }, (error) => {
  if (error) {
    alert("Name is in use.");
    location.href = "/";
  }
});

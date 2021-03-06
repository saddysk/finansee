window.onload = (event) => { startCall(); };

// const webSocket = new WebSocket("ws://15.207.92.194:3000")
const webSocket = new WebSocket("ws://127.0.0.1:3000");
webSocket.onopen = () => console.log("Opened!!!");

// handle signaling data from websocket
webSocket.onmessage = (event) => {
  handleSignallingData(JSON.parse(event.data));
};
function handleSignallingData(data) {
  switch (data.type) {
    case "answer":
      peerConn.setRemoteDescription(data.answer);
      break;
    case "candidate":
      peerConn.addIceCandidate(data.candidate);
  }
}

// send and store username/ code to the server temporarily
let username;
// function to send any data to the server
function sendData(data) {
  data.username = username;
  webSocket.send(JSON.stringify(data));
}

// Configuring STUN servers
let configuration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
};
// Create Peer Connection
let peerConn = new RTCPeerConnection(configuration);
// handle events on Start Call button click
let localStream;
let videoSender;
let flag = false;
function startCall() {
  document.getElementById("video-call").style.display = "flex";

  // Accessing with media devices
  navigator.mediaDevices
    .getUserMedia({
      video: {
        frameRate: 24,
        width: {
          min: 720,
          ideal: 1080,
          max: 1920,
        },
        aspectRatio: 1.33333,
      },
      audio: true,
    })
    .then((stream) => {
      // Set local video track
      localStream = stream;
      console.log("Local video started!!!");
      document.getElementById("local-video").srcObject = localStream;
      flag = true;

      // Adding local MediaTracks on the Connection
      videoSender = peerConn.addTrack(
        localStream.getVideoTracks()[0],
        localStream
      );

      peerConn.ontrack = (e) => {
        // Set remote video track
        console.log("Remote video started!!!");
        document.getElementById("remote-video").srcObject = e.streams[0];
        // Set Timer
        setTimer();
      };

      //   Send ICE Candidate
      peerConn.onicecandidate = (e) => {
        if (e.candidate == null) return;

        sendData({
          type: "store_candidate",
          candidate: e.candidate,
        });
      };

      createAndSendOffer();
    })
    .catch((error) => {
      console.log(error);
    });
}

// Create and send OFFER to other client through websocket
function createAndSendOffer() {
  peerConn.createOffer(
    (offer) => {
      peerConn.setLocalDescription(offer);
    },
    (error) => {
      console.log(error);
    }
  );
}

// Screen share feature
let screenShareBtn = document.getElementById("shareBtn");
function screenShare() {
  navigator.mediaDevices
    .getDisplayMedia({ video: true })
    .then((screenStream) => {
      document.getElementById("local-video").srcObject = screenStream;
      let screenVideoTrack = screenStream.getVideoTracks()[0];
      videoSender.replaceTrack(screenVideoTrack);
      screenShareBtn.disabled = true;

      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        document.getElementById("local-video").srcObject = localStream;
        videoSender.replaceTrack(localStream.getVideoTracks()[0], localStream);
        screenShareBtn.disabled = false;
      });
    })
    .catch((e) => console.log("Error: " + e));
}

// Chat Feature //
// Create Data Channel
const dataChannel = peerConn.createDataChannel("channel");
dataChannel.onopen = (e) => console.log("Connection Opened!");
// handle event when remote peer leave the call
dataChannel.onclose = (e) => {
  document.getElementById("remote-video").srcObject = null;
  console.log("Connection Closed!");
};

//   Show received message
let count = 0,
  receivedFileSize = 0;
let receiveBuffer = [];
let fileName, fileSize, receivedData;
dataChannel.onmessage = async (e) => {
  try {
    receivedData = JSON.parse(e.data);
  } catch (error) {
    receivedData = e.data;
  }
  if (typeof receivedData == "object") {
    if (count == 0) {
      fileName = receivedData.fileName;
      fileSize = receivedData.fileSize;
      count = 1;
    } else {
      if (receivedData instanceof Blob) {
        receivedFileSize += receivedData.size;
      } else {
        receivedFileSize += receivedData.byteLength;
      }

      receiveBuffer.push(receivedData);

      if (receivedFileSize == fileSize) {
        const receivedFile = new Blob(receiveBuffer);
        appendFile(receivedFile, fileName, "left");
        console.log("File Received!");
        receivedFileSize = 0;
        receiveBuffer = [];
        count = 0;
      }
    }
  } else {
    appendMessage(receivedData, "left");
  }
};

// get elements
const sendMessageBtn = document.getElementById("sendMessageBtn");
const openChatWindow = document.getElementById("openChat");
let chatContainer = document.getElementById("chatContainer");
let videoContainer = document.getElementById("videoContainer");
const message = document.getElementById("inputMessage");

// Retrieve and Send message
sendMessageBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const isMessageValid = message.value.replace(/\s+/, "");
  if (isMessageValid !== "") {
    dataChannel.send(message.value);
    appendMessage(message.value, "right");
  }
  message.value = "";
});

// Read and Send File
let inputFile = document.getElementById("inputFile");
let sendFileBtn = document.getElementById("sendFileBtn");

sendFileBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const file = inputFile.files[0];
  if (file == undefined) {
    alert("No file has been selected");
    return;
  }
  if (file.size === 0) {
    alert("File is empty, please select a non-empty file");
    return;
  }

  const chunkSize = 16384;
  reader = new FileReader();
  let offset = 0;
  let count = 0;
  let sendFileSize = null;
  reader.addEventListener("error", (error) => alert("Error reading file"));
  // sending the file once loaded by the file reader
  reader.addEventListener("load", (event) => {
    if (count == 0) {
      let dataFile = {
        fileName: file.name,
        fileSize: file.size,
      };
      dataChannel.send(JSON.stringify(dataFile));
      inputFile.value = "";
      count = 1;
    }
    let myResult = event.target.result;
    sendFileSize += myResult.byteLength;

    dataChannel.send(myResult);

    if (sendFileSize == file.size) {
      count = 0;
      appendFile(file, file.name, "right");
      console.log("File sent!");
    }

    offset += myResult.byteLength;
    if (offset < file.size) {
      readSlice(offset);
    }
  });
  // slicing
  const readSlice = (o) => {
    const slice = file.slice(offset, o + chunkSize);
    reader.readAsArrayBuffer(slice);
  };
  readSlice(0);
});

let element = null;
// Append Element
const append = (message, position) => {
  element.innerText = message;
  element.classList.add("message");
  element.classList.add(position);
  document.getElementById("displayMessages").appendChild(element);
};

// Append incoming files
const appendFile = (downloadFile, fileName, position) => {
  // const appendFile = (downloadFile, position) => {
  element = document.createElement("a");
  element.href = URL.createObjectURL(downloadFile);
  element.download = fileName;
  append(fileName, position);
};
// Append incoming & outgoing messages in chat container
const appendMessage = (message, position) => {
  element = document.createElement("div");
  append(message, position);
};

// Open chat box
let isChatOpen = false;
openChatWindow.addEventListener("click", (e) => {
  if (!isChatOpen) {
    chatContainer.style.display = "block";
    videoContainer.style.width = "75%";
    isChatOpen = !isChatOpen;
  } else {
    chatContainer.style.display = "none";
    videoContainer.style.width = "100%";
    isChatOpen = !isChatOpen;
  }
});

// get icons
let muteAudioIcon = document.getElementById("muteAudioIcon");
let unMuteAudioIcon = document.getElementById("unMuteAudioIcon");
// Mute Audio
let isAudio = true;
function muteAudio() {
  if (flag) {
    if (isAudio) {
      isAudio = !isAudio;
      localStream.getAudioTracks()[0].enabled = isAudio;
      muteAudioIcon.style.display = "none";
      unMuteAudioIcon.style.display = "block";
    } else {
      isAudio = !isAudio;
      localStream.getAudioTracks()[0].enabled = isAudio;
      unMuteAudioIcon.style.display = "none";
      muteAudioIcon.style.display = "block";
    }
  }
}

// get icons
let muteVideoIcon = document.getElementById("muteVideoIcon");
let unMuteVideoIcon = document.getElementById("unMuteVideoIcon");
// Mute Video
let isVideo = true;
function muteVideo() {
  if (flag) {
    if (isVideo) {
      isVideo = !isVideo;
      localStream.getVideoTracks()[0].enabled = isVideo;
      muteVideoIcon.style.display = "none";
      unMuteVideoIcon.style.display = "block";
    } else {
      isVideo = !isVideo;
      localStream.getVideoTracks()[0].enabled = isVideo;
      unMuteVideoIcon.style.display = "none";
      muteVideoIcon.style.display = "block";
    }
  }
}

// leave call
function leaveCall() {
  peerConn.close();
  window.location.assign("https://finansee.github.io");
}

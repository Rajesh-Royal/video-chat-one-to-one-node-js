const socket = io('/')
const videoGrid = document.getElementById('video-grid')

//it will work on online and localhost we have our own peer server on heroku
const myPeer = new Peer({host:'peer-server-video-chat.herokuapp.com', secure:true})

//It will work on localhost only
// const myPeer = new Peer(undefined, {
//   host: '/',
//   port: "65523"
// })

//global elements
const userVideoControls = document.getElementById('videoElement');
const selfVideoControls = document.getElementById('videoSelfElement');

const myVideo = document.getElementById('videoSelfElement');
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addSelfVideoStream(myVideo, stream);
  
  function addSelfVideoStream(video, stream) {
    video.srcObject = stream;
    console.log(stream);
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
  }


//CHECK FOR INCOMING CALL AND ACCEPT THEM
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.getElementById('videoElement')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.getElementById('videoElement')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.srcObject = null;
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
}



//styling

document.getElementById('hide-video').addEventListener('click', function(){
  if(document.getElementsByClassName("hide")[0] == undefined){
    document.getElementById("videoSelfElement").classList.add("hide");
    //eye icon change on click
    document.getElementById("hide-video").classList.remove("fa-eye");
    document.getElementById("hide-video").classList.add("fa-eye-slash");
  }else{
    document.getElementById("videoSelfElement").classList.remove("hide");
    document.getElementById("hide-video").classList.add("fa-eye");
    document.getElementById("hide-video").classList.remove("fa-eye-slash");
  }
});

//cancel call
document.getElementById('cancel-call').addEventListener('click', function(){
  window.location.href = "/";
});

//turn off audio
var audioIcon = document.getElementById("off-volume");
document.getElementById('off-volume').addEventListener('click', function(){
  if(userVideoControls.volume != 1){
    userVideoControls.volume = 1;
    try {
      audioIcon.classList.remove("fa-volume-off");
      audioIcon.classList.add("fa-volume-up");
    } catch (error) {
      console.log(error);
    }
    
  }else{
    userVideoControls.volume = 0;
    try {
      audioIcon.classList.add("fa-volume-off");
      audioIcon.classList.remove("fa-volume-up");
    } catch (error) {
      console.log(error);
    }
  }
});

//mute call
var micIcon = document.getElementById("off-mic");
document.getElementById('off-mic').addEventListener('click', function(){
  if(selfVideoControls.muted == true){
    selfVideoControls.muted = false;
    try {
      micIcon.classList.remove("fa-microphone-slash");
      micIcon.classList.add("fa-microphone");
    } catch (error) {
      console.log(error);
    }
    
  }else{
    selfVideoControls.muted = true;
    try {
      micIcon.classList.add("fa-microphone-slash");
      micIcon.classList.remove("fa-microphone");
    } catch (error) {
      console.log(error);
    }
  }
});

//pause your own current stream
var cameraIcon = document.getElementById("off-camera");
document.getElementById('off-camera').addEventListener('click', function(){
  if(selfVideoControls.paused == true){
    selfVideoControls.play();
    try {
      cameraIcon.classList.remove("icon-visiblity");
    } catch (error) {
      console.log(error);
    }
    
  }else{
    selfVideoControls.pause();
    try {
      cameraIcon.classList.add("icon-visiblity");
    } catch (error) {
      console.log(error);
    }
  }
});
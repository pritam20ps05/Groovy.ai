const video = document.getElementById('video')
const btn = $('#clkphoto');
// var expressions = {};
var expressions = ['neutral', 'angry', 'disgusted', 'happy', 'sad', 'surprised', 'fearful']
var moods = ['neutral', 'angry', 'sad', 'happy', 'sad', 'energetic', 'fear']

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/static/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/static/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/static/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

btn.on('click', async (e)=>{
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
  // console.log(det);
  // console.log(detections[0].expressions.asSortedArray());
  let prob = []
  expressions.forEach(el => {
    prob.push(detections[0].expressions[el]);
  });
  let max=0;
  prob.forEach((el, i) => {
    if (prob[max]<el) {
      max = i;
    }
  });
  console.log(expressions[max]);
  window.location=`/player?mood=${moods[max]}`
})
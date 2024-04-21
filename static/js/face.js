const video = document.getElementById('video')
const btn = $('#clkphoto');
// var expressions = {};
var expressions = ['neutral', 'angry', 'disgusted', 'happy', 'sad', 'surprised', 'fearful']
var moods = ['neutral', 'angry', 'sad', 'happy', 'sad', 'energetic', 'fear']
var maxprob

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


video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  video.parentNode.insertBefore(canvas, video.nextSibling)
  // video.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections[0], displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    // console.log(resizedDetections)
  }, 100)
})

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
  console.log(expressions[max])
  maxprob = max
  $('#mood-predq').html(`<span>I</span>s your mood ${expressions[max]}?`)
  $('#mood-valdn').removeClass('d-none')
});

$('#opt-1').on('click', (e)=>{
  window.location=`/player?mood=${moods[maxprob]}`;
});

$('#opt-2').on('click', (e)=>{
  $('#mood-page').removeClass('d-none')
});
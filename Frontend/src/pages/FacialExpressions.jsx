import React from 'react'
import {
    FilesetResolver,
    FaceLandmarker
} from "@mediapipe/tasks-vision";
import { useRef, useState, useEffect } from "react";
import "./FacialExpressions.scss"
const FacialExpressions = () => {
   // Animation
    const canvasRef = useRef(null)
    const glowRef = useRef(null)
useEffect(() => {
  const canvas = canvasRef.current
  const parent = canvas.parentElement
  const ctx = canvas.getContext("2d")
  const glow = glowRef.current
let gx = -9999
let gy = -9999
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const COLORS = ["#5ac8fa", "#c44dff"]
  const RADIUS = 130
  const PUSH = 6
  const mouse = { x: -9999, y: -9999 }
  let particles = []
  let w = 0
  let h = 0
  let raf

  const create = () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 2 + Math.random() * 3,
    speed: 0.15 + Math.random() * 0.35,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    dx: 0,
    dy: 0,
  })

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    w = parent.offsetWidth
    h = parent.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = Math.min(60, Math.max(80, Math.round((w * h) / 45000)))
    particles = Array.from({ length: count }, create)
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    if (mouse.x > -9000) {
  if (gx < -9000) { gx = mouse.x; gy = mouse.y } // first appearance: no flying in from the corner
  gx += (mouse.x - gx) * 0.15 // smooth trailing follow
  gy += (mouse.y - gy) * 0.15
  glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`
  glow.style.opacity = 1
} else {
  glow.style.opacity = 0
  gx = -9999
}
    for (const p of particles) {
      if (!reduceMotion) {
        p.y -= p.speed
        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        const distX = p.x + p.dx - mouse.x
        const distY = p.y + p.dy - mouse.y
        const dist = Math.hypot(distX, distY)
        if (dist < RADIUS && dist > 0) {
          const force = (1 - dist / RADIUS) * PUSH
          p.dx += (distX / dist) * force
          p.dy += (distY / dist) * force
        }
        p.dx *= 0.94
        p.dy *= 0.94
      }
      ctx.beginPath()
      ctx.arc(p.x + p.dx, p.y + p.dy, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.color // fully opaque
      ctx.fill()
    }
    raf = requestAnimationFrame(draw)
  }

  const setPointer = (cx, cy) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = cx - rect.left
    mouse.y = cy - rect.top
  }
  const onMouseMove = (e) => setPointer(e.clientX, e.clientY)
  const onTouchMove = (e) => setPointer(e.touches[0].clientX, e.touches[0].clientY)
  const clearPointer = () => { mouse.x = -9999; mouse.y = -9999 }

  resize()
  draw()

  const observer = new ResizeObserver(resize)
  observer.observe(parent)
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("touchmove", onTouchMove, { passive: true })
  window.addEventListener("touchend", clearPointer)
  document.addEventListener("mouseleave", clearPointer)

  return () => {
    cancelAnimationFrame(raf)
    observer.disconnect()
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("touchmove", onTouchMove)
    window.removeEventListener("touchend", clearPointer)
    document.removeEventListener("mouseleave", clearPointer)
  }
}, [])
   // animation ends here 


    // 1. Camera access
  const videoRef = useRef(null); // ACCSSES TO HTML VIDEO ELEMENT
   const streamRef = useRef(null);

    const [cameraOn, setCameraOn] = useState(false);
    const [error, setError] = useState("");
        const startCamera = async () => {
         try {
        setLoading(true);

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false // no microphone access 
        }); // Request CAmera permission

        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        // Load MediaPipe model
        await initializeModel();

        // Start analyzing frames
        detectExpressions();

        setCameraOn(true);
        analyzeMood();

    } catch (err) {

        console.log(err);
        setError("Camera or model initialization failed.");

        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

    } finally {
        setLoading(false);
    }
    };
    // For stopping Camera 
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop()); //Stops  every track
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null; // disconnects the video 
        }

        setCameraOn(false);
    };

    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, []);
   // 2. Initialize FaceLandMarker
   const landmarkerRef = useRef(null);
const animationRef = useRef(null);

const [loading, setLoading] = useState(false);
const [blendshapes, setBlendshapes] = useState([]);
const initializeModel = async () => {
   // this preapres AI model
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    const faceLandmarker = await FaceLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath: "/face_landmarker.task",
                delegate: "GPU"
            },

            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: true
        }
    );

    landmarkerRef.current = faceLandmarker;
};
const detectExpressions = () => {
 // For Facial Analysis
    const video = videoRef.current;
    const landmarker = landmarkerRef.current; // gets the video and model

    if (!video || !landmarker) return;

    if (video.readyState >= 2) {
     // checks if  frames is available 
        const results = landmarker.detectForVideo(
            video,
            performance.now()
        ); // MediaPipe snalyzing the current framw 
      
        if (results.faceBlendshapes.length > 0) { // checking whether a face is detected

            const categories =
                results.faceBlendshapes[0].categories;

            setBlendshapes(categories);
            if(isAnalyzingRef.current)
            {
                const scores={}
                categories.forEach((item)=>
                {
                    scores[item.categoryName]= item.score
                })
                samplesRef.current.push(scores) // After several frames the array will conatin multiple objects . it will use to detect final expressions
            }

        } else {
            setBlendshapes([]);
        }
    }

    animationRef.current =
        requestAnimationFrame(detectExpressions);
};
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [detectedMood, setDetectedMood] = useState("");

const samplesRef = useRef([]);
const isAnalyzingRef = useRef(false);
const analyzeMood = async () => {

    // Clear previous results
    samplesRef.current = [];
    setDetectedMood("");

    // Start collecting scores
    isAnalyzingRef.current = true;
    setIsAnalyzing(true);

    // Wait for 4 seconds
    await new Promise((resolve) => {
        setTimeout(resolve, 4000);
    });

    // Stop collecting scores
    isAnalyzingRef.current = false;
    setIsAnalyzing(false);

    // Get all collected samples
    const samples = samplesRef.current;

    if (samples.length < 10) {
        setDetectedMood("Unable to detect");
        return;
    }

    // Calculate average scores
    const averages = {};

    samples.forEach((sample) => {

        Object.keys(sample).forEach((key) => {

            if (!averages[key]) {
                averages[key] = 0;
            }

            averages[key] += sample[key];

        });

    });

    Object.keys(averages).forEach((key) => {
        averages[key] = averages[key] / samples.length;
    });

    console.log("Average scores:", averages);
    console.log({
  mouthFrownLeft: averages.mouthFrownLeft,
  mouthFrownRight: averages.mouthFrownRight,
  browDownLeft: averages.browDownLeft,
  browDownRight: averages.browDownRight,
  browInnerUp: averages.browInnerUp,
  jawOpen: averages.jawOpen
});

    // Classify the mood
    const mood = classifyMood(averages);

    setDetectedMood(mood);
    if(mood)
    {
        stopCamera()
    }
};

const classifyMood = (scores) => {

    const smile =
        ((scores.mouthSmileLeft || 0) +
        (scores.mouthSmileRight || 0)) / 2;

    const frown =
        ((scores.mouthFrownLeft || 0) +
        (scores.mouthFrownRight || 0)) / 2;

    const browDown =
        ((scores.browDownLeft || 0) +
        (scores.browDownRight || 0)) / 2;

    const eyeSquint =
        ((scores.eyeSquintLeft || 0) +
        (scores.eyeSquintRight || 0)) / 2;

    const eyeWide =
        ((scores.eyeWideLeft || 0) +
        (scores.eyeWideRight || 0)) / 2;

    const jawOpen = scores.jawOpen || 0;

    const browInnerUp = scores.browInnerUp || 0;


    // Surprised
    if (eyeWide > 0.35 && jawOpen > 0.25) {
        return "Surprised  😲";
    }

    // Angry
    if (browDown > 0.05 ) {
        return "Angry  😠";
    }

    // Happy
    if (smile > 0.45) {
        return "Happy  😊";
    }

    // Sad
    if (frown > 0.30 ) {
        return "Sad 😢";
    }

    // Default
    return "Neutral 😐";
};
    useEffect(() => {

    return () => {

        cancelAnimationFrame(animationRef.current);

        streamRef.current?.getTracks().forEach(track => {
            track.stop();
        });

        landmarkerRef.current?.close();

    };

}, []);
  return (
     <main className="frame">
        <div ref={glowRef} className="glow" aria-hidden="true" />
          <canvas ref={canvasRef} className="particles" aria-hidden="true" />
      < div className="inner">
      <div className={`camera-video ${cameraOn ? "" : "hidden"}`}>
        <video ref={videoRef} autoPlay playsInline muted />
      </div>
            {(!detectedMood &&!isAnalyzing) && (
            <div className='camera-off'>
                <h1 className="soft-bg">Analyze your expression</h1>
                <button onClick={startCamera}>
                    Start Camera
                </button>
            </div>
                
            ) }
   {error && <p>{error}</p>}
    {isAnalyzing && (
    <p className='status soft-bg'>Analyzing your mood... Please wait 4 seconds.</p> )}
{detectedMood && (
  <div className='result'>
    <section className="upper soft-bg">
        <h2 >Detected Mood</h2>
    <h1> {detectedMood} </h1>
    </section>
    
    <section className="lower">
        <button>
      See Recommended Songs
    </button>
    <button className='analyze-again ' onClick={startCamera}>
      Analyze again
    </button>
    </section>
  </div>)} </div>
    </main>
  )
}

export default FacialExpressions

// FilesetResolver loads the MediaPipe vision resources. FaceLandmarker initializes the face detection model.

//navigator.mediaDevices is a browser API that provides access to media devices such as cameras and microphones.

// MediaStream is a continuous flow of camera frames.

// WASM stands for WebAssembly.It's a technology that allows code compiled into WebAssembly to run in the browser.MediaPipe uses these files to execute its vision tasks.
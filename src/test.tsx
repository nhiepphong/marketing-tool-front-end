import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import "./App.css";

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lipCanvasRef = useRef<HTMLCanvasElement>(null);
  const [lipColor, setLipColor] = useState("#FF0000");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.loadSsdMobilenetv1Model("/models");
      await faceapi.loadFaceLandmarkModel(
        "/models/face_landmark_68_model-weights_manifest.json"
      );
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  const handleCapture = async () => {
    if (!modelsLoaded) {
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const img = await faceapi.fetchImage(imageSrc);
      const detections = await faceapi.detectAllFaces(img).withFaceLandmarks();

      if (detections.length > 0) {
        const lipLandmarks = detections[0].landmarks.getMouth();
        const canvas = canvasRef.current;
        const lipCanvas = lipCanvasRef.current;
        if (canvas && lipCanvas) {
          const ctx = canvas.getContext("2d");
          const lipCtx = lipCanvas.getContext("2d");
          if (ctx && lipCtx) {
            // Vẽ ảnh gốc lên canvas chính
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Tính toán kích thước và vị trí của vùng môi
            const lipRect = getLipRect(lipLandmarks);

            // Tạo một canvas tạm để chứa vùng môi
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = lipRect.width;
            tempCanvas.height = lipRect.height;
            const tempCtx = tempCanvas.getContext("2d");

            // Cắt vùng môi từ ảnh gốc và vẽ lên canvas tạm
            tempCtx?.drawImage(
              img,
              lipRect.x,
              lipRect.y,
              lipRect.width,
              lipRect.height,
              0,
              0,
              lipRect.width,
              lipRect.height
            );

            // Tô màu cho vùng môi trên canvas tạm
            tempCtx!.fillStyle = lipColor;
            tempCtx!.globalCompositeOperation = "source-in";
            tempCtx!.fillRect(0, 0, lipRect.width, lipRect.height);

            // Vẽ vùng môi đã tô màu lên canvas môi
            lipCtx.clearRect(0, 0, lipCanvas.width, lipCanvas.height);
            lipCtx.drawImage(tempCanvas, 0, 0);

            // Lưu hình môi của người dùng (bạn có thể thay đổi cách lưu trữ phù hợp)
            const lipImage = lipCanvas.toDataURL("image/png");
            // Gửi lipImage lên server hoặc lưu vào bộ nhớ local để làm kỷ niệm

            // Đặt kích thước canvas môi theo kích thước vùng môi
            lipCanvas.width = lipRect.width;
            lipCanvas.height = lipRect.height;
          }
        }
      }
    }
  };

  const getLipRect = (lipLandmarks: faceapi.Point[]) => {
    const xs = lipLandmarks.map(({ x }) => x);
    const ys = lipLandmarks.map(({ y }) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    return { x: minX, y: minY, width, height };
  };

  return (
    <div>
      <Webcam ref={webcamRef} />
      <button onClick={handleCapture} disabled={!modelsLoaded}>
        {modelsLoaded ? "Capture" : "Loading..."}
      </button>
      <canvas ref={canvasRef} width={640} height={480} />
      <canvas ref={lipCanvasRef} width={640} height={480} />
      <input
        type="color"
        value={lipColor}
        onChange={(e) => setLipColor(e.target.value)}
      />
    </div>
  );
}

export default App;

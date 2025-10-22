"use client";

import React from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import Konva from "konva";

interface ImageData {
  x: number;
  y: number;
  src: string;
  id: string;
}

const URLImage = ({ image }: { image: ImageData }) => {
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const imageObj = new window.Image();
    imageObj.src = image.src;
    imageObj.onload = () => {
      setImg(imageObj);
    };
  }, [image.src]);

  if (!img) {
    return null;
  }

  return (
    <KonvaImage
      image={img}
      x={image.x}
      y={image.y}
      // I will use offset to set origin to the center of the image
      offsetX={img.width / 2}
      offsetY={img.height / 2}
      draggable
    />
  );
};

const TransformableURLImage = ({ image }: { image: ImageData }) => {
  const shapeRef = React.useRef<Konva.Image>(null);
  const trRef = React.useRef<Konva.Transformer>(null);
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const imageObj = new window.Image();
    imageObj.src = image.src;
    imageObj.onload = () => {
      setImg(imageObj);
    };
  }, [image.src]);

  React.useEffect(() => {
    if (trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [img]);

  if (!img) {
    return null;
  }

  return (
    <React.Fragment>
      <KonvaImage
        image={img}
        x={image.x}
        y={image.y}
        offsetX={img.width / 2}
        offsetY={img.height / 2}
        ref={shapeRef}
        draggable
      />
      <Transformer ref={trRef} />
    </React.Fragment>
  );
};

const App = () => {
  const dragUrl = React.useRef<string>("");
  const stageRef = React.useRef<Konva.Stage>(null);
  const [images, setImages] = React.useState<ImageData[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Check if files were dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Check if it's an image file
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && stageRef.current) {
            stageRef.current.setPointersPositions(e);
            const position = stageRef.current.getPointerPosition();

            setImages(
              images.concat([
                {
                  x: position?.x || 0,
                  y: position?.y || 0,
                  src: event.target.result as string,
                  id: Date.now().toString(),
                },
              ])
            );
          }
        };
        reader.readAsDataURL(file);
      }
    }
    // Check if it's a URL being dragged
    else if (dragUrl.current && stageRef.current) {
      stageRef.current.setPointersPositions(e);
      const position = stageRef.current.getPointerPosition();

      setImages(
        images.concat([
          {
            x: position?.x || 0,
            y: position?.y || 0,
            src: dragUrl.current,
            id: Date.now().toString(),
          },
        ])
      );
      dragUrl.current = "";
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(
              images.concat([
                {
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                  src: event.target.result as string,
                  id: Date.now().toString(),
                },
              ])
            );
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCanvasExport = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = "canvas-image.png";
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="w-screen h-screen flex flex-col items-center p-4">
      <h1>Multi Layout App</h1>
      <button onClick={() => fileInputRef.current?.click()}>
        Upload Image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileInput}
      />

      <button onClick={() => handleCanvasExport()}>Export Canvas as PNG</button>
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ display: "inline-block" }}
      >
        <Stage
          width={1000}
          height={1000}
          scale={{ x: 0.1, y: 0.1 }}
          className="w-full"
          ref={stageRef}
        >
          <Layer>
            {images.map((image) => {
              return <TransformableURLImage key={image.id} image={image} />;
            })}
          </Layer>
        </Stage>
      </div>
    </main>
  );
};

export default App;

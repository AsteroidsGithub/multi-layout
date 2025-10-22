"use client";

import {
    HandleFileDrop,
    updateCanvasSizeResponsive,
} from "@/components/canvas";
import useWindowSize from "@/components/window";
import Konva from "konva";
import { useState, useRef, useEffect, Fragment } from "react";
import {
    Circle,
    Layer,
    Rect,
    Stage,
    Image as KonvaImage,
    Transformer,
} from "react-konva";

interface ImageData {
    x: number;
    y: number;
    src: string;
    id: string;
}

const URLImage = ({ image }: { image: ImageData }) => {
    const [img, setImg] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
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
    const shapeRef = useRef<Konva.Image>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const [img, setImg] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const imageObj = new window.Image();
        imageObj.src = image.src;
        imageObj.onload = () => {
            setImg(imageObj);
        };
    }, [image.src]);

    useEffect(() => {
        if (trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [img]);

    if (!img) {
        return null;
    }

    return (
        <Fragment>
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
        </Fragment>
    );
};

export default function Page() {
    // Get current window size
    const { width, height } = useWindowSize();

    // Define virtual size for our scene
    const sceneWidth = 1000;
    const sceneHeight = 1000;

    // State to track current scale and dimensions
    const [stageSize, setStageSize] = useState({
        width: sceneWidth,
        height: sceneHeight,
        scale: 1,
    });

    // Reference to parent container
    const containerRef = useRef<HTMLDivElement>(null);
    const dragUrl = useRef<string>("");
    const stageRef = useRef<Konva.Stage>(null!);
    const [images, setImages] = useState<ImageData[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log("Resizing canvas");

        updateCanvasSizeResponsive(
            containerRef,
            { width: sceneWidth, height: sceneHeight },
            setStageSize
        );
    }, [width, height]);

    return (
        <div
            ref={containerRef}
            className="bg-white border-2 border-white w-full h-full overflow-hidden"
            onDrop={(e) => HandleFileDrop(e, stageRef, setImages)}
            onDragOver={(e) => e.preventDefault()}
        >
            <Stage
                width={stageSize.width}
                height={stageSize.height}
                scaleX={stageSize.scale}
                scaleY={stageSize.scale}
                ref={stageRef}
            >
                <Layer>
                    {images.map((image) => (
                        <TransformableURLImage key={image.id} image={image} />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}

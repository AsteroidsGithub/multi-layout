import React, { use, useEffect, useRef, useState } from "react";
import {
    Stage,
    Layer,
    Image as KonvaImage,
    Transformer,
    Circle,
    Rect,
} from "react-konva";
import Konva from "konva";

export interface ImageData {
    x: number;
    y: number;
    src: string;
    id: string;
}

/**
 * Handles Drag and Drop file events for images onto the Konva stage.
 *
 * @param e The initiating drag event
 * @param stageRef The reference to the Konva stage
 * @returns A ImageData object if successful, or an Error if not
 */
export function HandleFileDrop(
    e: React.DragEvent<HTMLDivElement>,
    stageRef: React.RefObject<Konva.Stage>,
    setImages: React.Dispatch<React.SetStateAction<ImageData[]>>
): void | Error {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];

        if (!file.type.startsWith("image/"))
            return new Error("Not an image file");

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target?.result && stageRef.current) {
                stageRef.current.setPointersPositions(e);
                const position = stageRef.current.getPointerPosition();

                return setImages((images) =>
                    images.concat([
                        {
                            x: position?.x || 0,
                            y: position?.y || 0,
                            src: event.target?.result as string,
                            id: Date.now().toString(),
                        },
                    ])
                );
            }
        };
        reader.readAsDataURL(file);
    }

    return new Error("No files dropped");
}

/**
 * Handles File Input change events for images selected via file input.
 *
 * @param e The initiating change event
 * @returns A ImageData object if successful, or an Error if not
 */
export function HandleFileInput(
    e: React.ChangeEvent<HTMLInputElement>,
    setImages: React.Dispatch<React.SetStateAction<ImageData[]>>
): void | Error {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];

        if (!file.type.startsWith("image/"))
            return new Error("Not an image file");

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target?.result) {
                return setImages((images) =>
                    images.concat([
                        {
                            x: window.innerWidth / 2,
                            y: window.innerHeight / 2,
                            src: event.target?.result as string,
                            id: Date.now().toString(),
                        },
                    ])
                );
            }
        };
        reader.readAsDataURL(file);
    }

    return new Error("No files selected");
}

export function updateCanvasSizeResponsive(
    containerRef: React.RefObject<HTMLDivElement | null>,
    sceneVector: { width: number; height: number },
    setStageSize: React.Dispatch<
        React.SetStateAction<{
            width: number;
            height: number;
            scale: number;
        }>
    >
) {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;

    const scale = containerWidth / sceneVector.width;

    setStageSize({
        width: sceneVector.width * scale,
        height: sceneVector.height * scale,
        scale: scale,
    });
}

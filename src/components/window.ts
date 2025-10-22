import { useState, useEffect } from "react";

const useWindowSize = () => {
    // Initialize state with current window dimensions (or 0 if on server-side)
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    useEffect(() => {
        // Only run on client-side where window object exists
        if (typeof window === "undefined") {
            return;
        }

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Add event listener for window resize
        window.addEventListener("resize", handleResize);

        // Initial call to set dimensions
        handleResize();

        // Clean up the event listener on component unmount
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return windowSize;
};

export default useWindowSize;

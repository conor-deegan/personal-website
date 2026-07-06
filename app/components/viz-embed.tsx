'use client';

import { useEffect, useRef, useState } from 'react';

// Generic embed for any self-contained page under public/viz/. Each viz page
// should include /viz/embed-resize.js, which posts its content height back
// here so the iframe fits exactly with no internal scrollbar.
export function Viz({
    src,
    title,
    height = 640,
}: {
    src: string;
    title: string;
    height?: number;
}) {
    const [frameHeight, setFrameHeight] = useState(height);
    const ref = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        function onMessage(e: MessageEvent) {
            if (
                e.source === ref.current?.contentWindow &&
                e.data &&
                e.data.type === 'viz-resize' &&
                typeof e.data.height === 'number'
            ) {
                setFrameHeight(e.data.height);
            }
        }
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    return (
        <div className="my-8 flex justify-center">
            <iframe
                ref={ref}
                src={src}
                title={title}
                loading="lazy"
                scrolling="no"
                style={{
                    width: '100%',
                    maxWidth: '720px',
                    height: frameHeight,
                    border: 'none',
                    display: 'block',
                }}
            />
        </div>
    );
}

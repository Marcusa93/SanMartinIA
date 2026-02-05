'use client';

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html } from '@react-three/drei';
import { cn } from '../lib/utils';

// Componente para cargar el modelo 3D (formato .glb o .gltf)
function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

interface Player360ViewerProps {
    modelUrl?: string;
    className?: string; // For responsive sizing
    label?: string; // Custom label
}

export default function Player360Viewer({ modelUrl, className, label = "Vista 360°" }: Player360ViewerProps) {
    // Detect if the URL is a video file
    const isVideo = useMemo(() => {
        return modelUrl?.match(/\.(webm|mp4|mov)$/i);
    }, [modelUrl]);

    if (isVideo && modelUrl) {
        return (
            <div className={cn("w-full h-[500px] rounded-xl overflow-hidden relative group flex items-center justify-center", className)}>
                {/*
                  Video 360 player view
                  - Crops black sidebars and Veo watermark using scale + negative margins
                  - mix-blend-multiply makes white background transparent
                */}
                <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                    <video
                        src={modelUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-[130%] object-contain mix-blend-multiply"
                        style={{
                            clipPath: 'inset(8% 15% 12% 15%)', // top right bottom left - crops bars and Veo logo
                        }}
                    />
                </div>

                {/* Floating label */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-slate-100 text-primary uppercase tracking-wider z-10">
                    {label}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full h-[500px] bg-surface rounded-xl overflow-hidden shadow-inner relative border border-border", className)}>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <Suspense fallback={<Html center><span className="loading loading-spinner text-primary font-semibold tracking-wide">Cargando 3D...</span></Html>}>
                    {/* Stage configura luces y entorno automáticamente para que se vea profesional */}
                    <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
                        {modelUrl ? (
                            <Model url={modelUrl} />
                        ) : null}
                    </Stage>
                </Suspense>

                {/* Controles: autoRotate hace que gire solo. enableZoom={false} para no romper el scroll de la página */}
                <OrbitControls
                    autoRotate
                    autoRotateSpeed={4}
                    makeDefault
                    enableZoom={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                />
            </Canvas>

            {/* Etiqueta flotante opcional */}
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-white/20 text-primary uppercase tracking-wider">
                {label} (Rotate on Drag)
            </div>
        </div>
    );
}

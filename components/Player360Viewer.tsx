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
    status?: 'active' | 'injured' | 'recovering' | 'fatigue'; // Player status
    alertCount?: number; // Number of active alerts
}

const STATUS_CONFIG = {
    active: { color: 'bg-emerald-500', label: 'Activo', icon: '✓' },
    injured: { color: 'bg-red-500', label: 'Lesionado', icon: '🏥' },
    recovering: { color: 'bg-amber-500', label: 'En recuperación', icon: '🔄' },
    fatigue: { color: 'bg-orange-500', label: 'Fatiga alta', icon: '⚡' },
};

export default function Player360Viewer({ modelUrl, className, label = "Vista 360°", status, alertCount }: Player360ViewerProps) {
    // Detect if the URL is a video file
    const isVideo = useMemo(() => {
        return modelUrl?.match(/\.(webm|mp4|mov)$/i);
    }, [modelUrl]);

    const statusConfig = status ? STATUS_CONFIG[status] : null;

    if (isVideo && modelUrl) {
        return (
            <div
                className={cn(
                    "w-full h-[400px] rounded-2xl overflow-hidden relative group flex items-center justify-center",
                    "player-360-container",
                    className
                )}
            >
                {/* Status indicator - top right */}
                {statusConfig && (
                    <div className={cn(
                        "absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg",
                        statusConfig.color,
                        "text-white animate-pulse"
                    )}>
                        <span>{statusConfig.icon}</span>
                        <span>{statusConfig.label}</span>
                    </div>
                )}

                {/* Alert badge - top left */}
                {alertCount && alertCount > 0 && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>{alertCount} alerta{alertCount > 1 ? 's' : ''}</span>
                    </div>
                )}

                {/* Video container - simple and transparent */}
                <div className="w-full h-full flex items-center justify-center">
                    <video
                        src={`${modelUrl}?v=2`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className={cn(
                            "player-360-video w-full h-full object-cover scale-[1.15] hover:scale-[1.2] transition-transform duration-500",
                            status === 'injured' && "grayscale-[30%] opacity-90",
                            status === 'fatigue' && "saturate-[1.2]"
                        )}
                    />
                </div>

                {/* Floating label with theme-aware styling */}
                <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-border text-primary uppercase tracking-wider z-10">
                    {label}
                </div>

                {/* Glow effect for injured/fatigue */}
                {(status === 'injured' || status === 'fatigue') && (
                    <div className={cn(
                        "absolute inset-0 pointer-events-none rounded-2xl",
                        status === 'injured' && "ring-2 ring-red-500/50 ring-inset",
                        status === 'fatigue' && "ring-2 ring-orange-500/50 ring-inset"
                    )} />
                )}
            </div>
        );
    }

    return (
        <div className={cn("w-full h-[400px] bg-surface rounded-2xl overflow-hidden shadow-inner relative border border-border", className)}>
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
            <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-border text-primary uppercase tracking-wider">
                {label} (Rotate on Drag)
            </div>
        </div>
    );
}

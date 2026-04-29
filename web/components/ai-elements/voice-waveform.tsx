"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceWaveformProps = ComponentProps<"div"> & {
  stream: MediaStream | null;
  /** Number of bars to render. Default: 32 */
  barCount?: number;
  /** Minimum bar height in pixels. Default: 4 */
  minBarHeight?: number;
  /** Maximum bar height in pixels. Default: 24 */
  maxBarHeight?: number;
};

export const VoiceWaveform = ({
  className,
  stream,
  barCount = 32,
  minBarHeight = 4,
  maxBarHeight = 24,
  ...props
}: VoiceWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [isActive, setIsActive] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / barCount;
    const gap = 2;
    const step = Math.floor(bufferLength / barCount);

    for (let i = 0; i < barCount; i += 1) {
      const dataIndex = i * step;
      const value = dataArray[dataIndex] / 255;
      const barHeight = Math.max(minBarHeight, value * maxBarHeight);

      const x = i * barWidth + gap / 2;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = "hsl(0 0% 50%)";
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth - gap, barHeight, 2);
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [barCount, minBarHeight, maxBarHeight]);

  useEffect(() => {
    if (!stream) {
      setIsActive(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      sourceRef.current = null;
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
    setIsActive(true);

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      audioContext.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, [stream, draw]);

  return (
    <div
      className={cn(
        "relative flex h-12 w-full items-center justify-center rounded-lg bg-muted/50 px-3",
        className
      )}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className={cn("h-full w-full", isActive ? "opacity-100" : "opacity-30")}
        height={48}
        width={300}
      />
    </div>
  );
};

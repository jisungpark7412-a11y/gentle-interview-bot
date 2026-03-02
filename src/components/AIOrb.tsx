import { useEffect, useRef } from "react";

const AIOrb = ({ isListening = false }: { isListening?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseRadius = 60;

      // Outer glow rings
      for (let i = 3; i >= 0; i--) {
        const r = baseRadius + i * 20 + Math.sin(time * 2 + i) * 5;
        const alpha = 0.03 - i * 0.006;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(174, 60%, 51%, ${alpha})`;
        ctx.fill();
      }

      // Main orb gradient
      const pulseScale = 1 + Math.sin(time * 1.5) * (isListening ? 0.08 : 0.04);
      const orbRadius = baseRadius * pulseScale;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius);
      gradient.addColorStop(0, "hsla(174, 60%, 65%, 0.9)");
      gradient.addColorStop(0.5, "hsla(174, 60%, 51%, 0.6)");
      gradient.addColorStop(1, "hsla(174, 60%, 40%, 0.1)");

      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner core
      const innerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 0.5);
      innerGradient.addColorStop(0, "hsla(174, 70%, 80%, 0.8)");
      innerGradient.addColorStop(1, "hsla(174, 60%, 51%, 0)");

      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();

      // Listening ripples
      if (isListening) {
        for (let i = 0; i < 3; i++) {
          const rippleTime = (time * 2 + i * 0.8) % 3;
          const rippleRadius = baseRadius + rippleTime * 40;
          const rippleAlpha = Math.max(0, 0.3 - rippleTime * 0.1);
          ctx.beginPath();
          ctx.arc(cx, cy, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(174, 60%, 51%, ${rippleAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isListening]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="animate-float"
      />
    </div>
  );
};

export default AIOrb;

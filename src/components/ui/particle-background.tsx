import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className,
  particleCount = 50,
  colors = ["#00D9FF", "#B026FF", "#00FFF0"],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      pulse: number;
      pulseSpeed: number;
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
        pulse: 0,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Pulse effect
        particle.pulse += particle.pulseSpeed;
        const pulseFactor = Math.sin(particle.pulse) * 0.3 + 1;

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        // Outer glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * pulseFactor * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * pulseFactor * 3
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        ctx.restore();

        // Draw connections
        particles.slice(index + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / 150) * 0.2;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [particleCount, colors]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 pointer-events-none z-0", className)}
    />
  );
};

export { ParticleBackground };

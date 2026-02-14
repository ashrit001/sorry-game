import { useEffect, useRef } from "react";
import { startPhaserGame, destroyPhaserGame } from "../game/PhaserGame";

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      startPhaserGame(containerRef.current.id);
    }

    return () => {
      destroyPhaserGame();
    };
  }, []);

  return (
    <div
      id="phaser-container"
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    />
  );
}

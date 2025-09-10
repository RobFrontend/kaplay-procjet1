import kaboom from "kaboom";
import { useEffect, useRef, useState } from "react";

function Game() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const k = kaboom({
        global: true,
        width: 1200,
        height: 720,
        canvas: canvasRef.current,
        background: [0, 0, 0],
        scale: 1,
      });

      k.loadBean();

      k.add([
        k.rect(1200, 20),
        k.outline(2),
        k.pos(0, 700),
        k.color(255, 255, 0),
        k.area(),
        k.body({
          isStatic: true,
        }),
      ]);

      k.add([
        k.rect(20, 720),
        k.outline(2),
        k.pos(-20, 0),
        k.color(255, 255, 0),
        k.area(),
        k.body({
          isStatic: true,
        }),
      ]);
      k.add([
        k.rect(20, 720),
        k.outline(2),
        k.pos(1200, 0),
        k.color(255, 255, 0),
        k.area(),
        k.body({
          isStatic: true,
        }),
      ]);

      setTimeout(() => {
        const orangeBox = k.add([
          k.rect(60, 60),
          k.pos(500, 500),
          k.color(255, 125, 0),
          k.area(),
          k.body(),
          "orangebox",
        ]);
      }, 2000);

      const btn1 = k.add([
        k.rect(10, 10),
        k.pos(1180, 10),
        k.color(255, 255, 255),
        k.area(),
        "btn1",
      ]);

      k.onClick("btn1", () => {
        if (!k.isFullscreen()) {
          k.setFullscreen();
        }
        if (k.isFullscreen()) {
          k.setFullscreen(false);
        }
      });

      k.onKeyPress((key) => {
        if (key === "f" && !k.isFullscreen()) {
          k.setFullscreen();
        }
        if (key === "f" && k.isFullscreen()) {
          k.setFullscreen(false);
        }
      });

      const player = k.add([
        k.sprite("bean"),
        k.area(),
        k.body(),
        k.health(100),
        k.pos(600, 600),
        "player",
        {
          dead: false,
          speed: 150,
        },
      ]);

      k.setGravity(1600);

      player.onCollide("orangebox", () => {
        k.debug.log("touched");
        player.hurt(20);
      });

      k.onKeyDown((key) => {
        if (key === "right" && !player.dead) {
          player.move(player.speed, 0);
        }
        if (key === "left" && !player.dead) {
          player.move(-player.speed, 0);
        }
      });
      k.onKeyDown((key) => {
        if (key === "space" && player.isGrounded()) {
          player.jump(600);
        }
      });
    }
  }, []);

  return <canvas ref={canvasRef} />;
}

export default Game;

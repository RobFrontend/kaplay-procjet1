import kaboom from "kaboom";
import { useEffect, useRef } from "react";
import { useArticles } from "./useArticles";

function Game({ isOpen }) {
  const canvasRef = useRef(null);
  let { data } = useArticles();

  const title1 = data && data[0].title;

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

      let textTest = k.add([
        k.text(`${data && data[0].title}`),
        k.pos(k.center()),
        k.color(255, 255, 255),
      ]);

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
      let textWindow = k.add([
        k.text("Full Screen"),
        k.pos(1050, 20),
        k.scale(0.5),
      ]);

      k.onClick("btn1", () => {
        if (!k.isFullscreen()) {
          k.setFullscreen();
          textWindow.text = "X Full Screen";
        }
        if (k.isFullscreen()) {
          k.setFullscreen(false);
          textWindow.text = "Full Screen";
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
        textTest.text = data[1].title;
      });

      if (!isOpen) {
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
    }
  }, [title1, data, isOpen]);
  if (!data)
    return (
      <div>
        <h1>Loading API</h1>
      </div>
    );
  return <canvas ref={canvasRef} />;
}

export default Game;

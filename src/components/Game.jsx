import { useEffect, useRef } from "react";
import { useArticles } from "./useArticles";
import kaplay from "kaplay";

function Game({ isOpen }) {
  const canvasRef = useRef(null);
  const kaplayRef = useRef(null);
  const playerRef = useRef(null);
  const textTestRef = useRef(null);
  const { data } = useArticles();

  // 1. Inicjalizacja gry tylko raz
  useEffect(() => {
    if (!canvasRef.current || kaplayRef.current || !data) return;

    const k = kaplay({
      global: true,
      width: 1200,
      height: 720,
      canvas: canvasRef.current,
      background: [0, 0, 0],
      scale: 1,
    });
    kaplayRef.current = k;

    k.loadBean();

    // tekst
    const textTest = k.add([
      k.text(data[0].title),
      k.pos(k.center()),
      k.color(255, 255, 255),
    ]);
    textTestRef.current = textTest;

    // podłogi / ściany
    k.add([
      k.rect(1200, 20),
      k.pos(0, 700),
      k.area(),
      k.body({ isStatic: true }),
    ]);
    k.add([
      k.rect(20, 720),
      k.pos(-20, 0),
      k.area(),
      k.body({ isStatic: true }),
    ]);
    k.add([
      k.rect(20, 720),
      k.pos(1200, 0),
      k.area(),
      k.body({ isStatic: true }),
    ]);

    // przeszkoda
    setTimeout(() => {
      k.add([
        k.rect(60, 60),
        k.pos(500, 500),
        k.color(125, 125, 0),
        k.area(),
        k.body(),
        "orangebox",
      ]);
    }, 2000);

    // fullscreen button
    const btn1 = k.add([k.rect(10, 10), k.pos(1180, 10), k.area(), "btn1"]);
    const textWindow = k.add([
      k.text("Full Screen"),
      k.pos(1050, 20),
      k.scale(0.5),
    ]);
    k.onClick("btn1", () => {
      k.setFullscreen(!k.isFullscreen());
      textWindow.text = k.isFullscreen() ? "X Full Screen" : "Full Screen";
    });

    // player
    const player = k.add([
      k.sprite("bean"),
      k.area(),
      k.body(),
      k.health(100),
      k.pos(600, 600),
      "player",
      { dead: false, speed: 150 },
    ]);
    playerRef.current = player;

    k.setGravity(1600);

    player.onCollide("orangebox", () => {
      player.hurt(20);
      if (data[1]) textTest.text = data[1].title;
    });
  }, [data]);

  // 2. Sterowanie zależne od isOpen
  useEffect(() => {
    const k = kaplayRef.current;
    const player = playerRef.current;
    if (!k || !player) return;

    if (!isOpen) {
      k.onKeyDown((key) => {
        if (key === "right") {
          !player.dead && player.move(player.speed, 0);
        }
      });
      k.onKeyDown((key) => {
        if (key === "left") {
          !player.dead && player.move(-player.speed, 0);
        }
      });
      k.onKeyDown((key) => {
        if (key === "space") {
          player.isGrounded() && player.jump(600);
        }
      });
    }
  }, [isOpen]);

  if (!data) return <h1>Loading API</h1>;

  return <canvas ref={canvasRef} tabIndex={0} />;
}

export default Game;

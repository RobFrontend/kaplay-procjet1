import { useEffect, useRef, useState } from "react";
import { useArticles } from "./useArticles";
import kaplay from "kaplay";

function Game({ isOpen }) {
  const canvasRef = useRef(null);
  const kaplayRef = useRef(null);
  const playerRef = useRef(null);
  const textTestRef = useRef(null);
  const { data } = useArticles();
  const [isJumpPower, setIsJumpPower] = useState(600);
  const [isPlayerSpeed, setIsPlayerSpeed] = useState(150);

  // to let Kaplay be inicialized only one time (there was a bug withour that)
  const jumpPowerRef = useRef(isJumpPower);
  const playerSpeedRef = useRef(isPlayerSpeed);

  useEffect(() => {
    jumpPowerRef.current = isJumpPower;
    playerSpeedRef.current = isPlayerSpeed;
  }, [isJumpPower, isPlayerSpeed]);
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

    // text
    const textTest = k.add([
      k.text(data[0].title),
      k.pos(k.center()),
      k.color(255, 255, 255),
    ]);
    textTestRef.current = textTest;

    // floor and wall  closed scene to not let player go outside of the map-  will change it later)
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

    // obstacles with bonuses
    setTimeout(() => {
      const boxjump = k.add([
        k.rect(60, 60),
        k.pos(500, 500),
        k.color(125, 125, 0),
        k.area(),
        k.body(),
        k.anchor("center"),
        "orangebox",
      ]);

      boxjump.add([
        k.text("+jump 5sec", { size: 16 }),
        k.color(255, 255, 255),
        k.anchor("center"),
      ]);
    }, 2000);

    setTimeout(() => {
      const boxspeed = k.add([
        k.rect(60, 60),
        k.pos(200, 200),
        k.color(244, 244, 244),
        k.area(),
        k.body(),
        k.anchor("center"),
        "whitebox",
      ]);
      boxspeed.add([
        k.text("+speed 5sec", { size: 16 }),
        k.color(186, 0, 0),
        k.anchor("center"),
      ]);
    }, 4000);

    setTimeout(() => {
      const boxsize = k.add([
        k.rect(60, 60),
        k.pos(900, 400),
        k.color(186, 0, 0),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("center"),
        "redbox",
      ]);
      boxsize.add([
        k.text("+size 10sec", { size: 16 }),
        k.color(255, 255, 255),
        k.anchor("center"),
      ]);
    }, 3000);

    // fullscreen button
    const btn1 = k.add([k.rect(10, 10), k.pos(1180, 10), k.area(), "btn1"]);
    const textWindow = k.add([
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

    // player
    const player = k.add([
      k.sprite("bean"),
      k.area(),
      k.body(),
      k.health(100),
      k.pos(600, 600),
      k.scale(1),
      "player",
      { dead: false, speed: playerSpeedRef.current },
    ]);
    playerRef.current = player;

    k.setGravity(1600);

    player.onCollide("orangebox", () => {
      player.hurt(20);
      if (data[1]) textTest.text = data[1].title;
      setIsJumpPower(1200);
      setTimeout(() => {
        setIsJumpPower(600);
      }, 5000);
    });
    player.onCollide("whitebox", () => {
      setIsPlayerSpeed(450);
      setTimeout(() => {
        setIsPlayerSpeed(150);
      }, 5000);
    });
    player.onCollide("redbox", () => {
      player.scaleTo(2);
      setTimeout(() => {
        player.scaleTo(1);
      }, 2500);
    });
  }, [data, isJumpPower, isPlayerSpeed]);

  // 2. Controls
  useEffect(() => {
    const k = kaplayRef.current;
    const player = playerRef.current;
    if (!k || !player) return;

    if (!isOpen) {
      k.onKeyDown(
        "right",
        () => !player.dead && player.move(playerSpeedRef.current, 0)
      );
      k.onKeyDown(
        "left",
        () => !player.dead && player.move(-playerSpeedRef.current, 0)
      );
      k.onKeyDown("space", () => {
        if (player.isGrounded()) {
          player.jump(jumpPowerRef.current);
        }
      });
    }
  }, [isOpen]);

  if (!data) return <h1>Loading API</h1>;

  return <canvas ref={canvasRef} tabIndex={0} />;
}

export default Game;

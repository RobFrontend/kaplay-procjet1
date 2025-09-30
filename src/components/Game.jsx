import { useEffect, useRef, useState } from "react";

import kaplay from "kaplay";

function Game({ isOpen }) {
  const canvasRef = useRef(null);
  const kaplayRef = useRef(null);
  const playerRef = useRef(null);
  const textTestRef = useRef(null);

  const txt = "siemka";

  const [isJumpPower, setIsJumpPower] = useState(800);
  const [isPlayerSpeed, setIsPlayerSpeed] = useState(150);

  // to let Kaplay be inicialized only one time (there was a bug withour that)
  const jumpPowerRef = useRef(isJumpPower);
  const playerSpeedRef = useRef(isPlayerSpeed);

  useEffect(() => {
    jumpPowerRef.current = isJumpPower;
    playerSpeedRef.current = isPlayerSpeed;
  }, [isJumpPower, isPlayerSpeed]);
  useEffect(() => {
    if (!canvasRef.current || kaplayRef.current) return;

    const k = kaplay({
      global: true,
      width: 1200,
      height: 720,
      canvas: canvasRef.current,
      // background: [0,0,0],

      scale: 1,
    });
    kaplayRef.current = k;

    k.loadBean();

    // text
    const textTest = k.add([
      k.text(txt),
      k.pos(k.center()),
      k.color(255, 255, 255),
    ]);
    textTestRef.current = textTest;

    // floor and wall  closed scene to not let player go outside of the map-  will change it later)
    k.add([
      k.rect(3000, 20),
      k.pos(0, 700),
      k.area(),
      k.body({ isStatic: true }),
    ]);

    // // great obstacle
    // k.add([
    //   k.rect(20, 720),
    //   k.pos(1200, 0),
    //   k.area(),
    //   k.body({ isStatic: true }),
    // ]);

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
      { dead: false, speed: playerSpeedRef.current, lives: 3 },
    ]);
    playerRef.current = player;

    k.setGravity(1600);
  }, [isJumpPower, isPlayerSpeed, isOpen]);

  // 2. Controls
  useEffect(() => {
    const k = kaplayRef.current;
    const player = playerRef.current;
    if (!k || !player) return;
    k.onUpdate(() => {
      if (!player) return;

      player.pos.x = Math.max(0, Math.min(player.pos.x, 1150));
      player.pos.y = Math.max(0, Math.min(player.pos.y, 720));
    });

    if (!isOpen) {
      const livesLabel = k.add([
        k.text("Lives: 3", { size: 24 }),
        k.pos(20, 20),
        k.color(255, 255, 255),
        "ui",
      ]);
      k.loadSprite("background", "/gamebg.jpg").then(() => {
        const bg = k.add([
          k.sprite("background"),
          k.pos(0, 0),
          { origin: "topleft", speed: 7500, z: -1 }, // tutaj origin w obiekcie
          // k.scale(k.width / 5600), // dopasowanie szerokości canvas
        ]);
        k.onUpdate(() => {
          bg.move(-bg.speed * k.dt(), 0);
          if (bg.pos.x <= -2520) bg.pos.x = 0;
        });
      });

      function spawnBonus() {
        const types = [
          {
            tag: "orangebox",
            color: [125, 125, 0],
            text: "+jump 7sec",
            effect: (player) => {
              setIsJumpPower(1200);
              setTimeout(() => setIsJumpPower(800), 7000); // 7 sekund
            },
            duration: 2,
          },
          {
            tag: "whitebox",
            color: [244, 244, 244],
            text: "+speed 7sec",
            effect: (player) => {
              setIsPlayerSpeed(450);
              setTimeout(() => setIsPlayerSpeed(150), 7000);
            },
            duration: 2,
          },
          {
            tag: "redbox",
            color: [186, 0, 0],
            text: "+size 5sec",
            effect: (player) => {
              player.scaleTo(2);
              setTimeout(() => player.scaleTo(1), 5000);
            },
            duration: 2,
          },
        ];

        const chosen = types[Math.floor(Math.random() * types.length)];

        const box = k.add([
          k.rect(60, 60),
          k.pos(200 + Math.random() * 600, 0), // X 200–800, Y = 0
          k.color(...chosen.color),
          k.area(),
          k.body(), // grawitacja
          k.anchor("center"),
          chosen.tag,
        ]);

        box.add([
          k.text(chosen.text, { size: 16 }),
          k.color(255, 255, 255),
          k.anchor("center"),
        ]);

        // usuń po X sekundach, jeśli gracz nie zbierze
        k.wait(chosen.duration, () => {
          if (box.exists()) destroy(box);
        });

        // kolizja z graczem
        player.onCollide(chosen.tag, () => {
          destroy(box); // znika natychmiast
          chosen.effect(player); // uruchom efekt
        });

        // zaplanuj kolejny bonus za 2–6 sekund
        k.wait(4 + Math.random() * 5, () => {
          spawnBonus();
        });
      }

      // startujemy spawnowanie po x sekundach

      k.wait(10, () => {
        spawnBonus();
      });

      function spawnObstacles() {
        // tutaj kod, który chcesz wykonać
        const size = 30;
        const x = 1200;
        const y = 420 + Math.random() * (300 - size); // max 300px nad ziemią

        const obstacle = k.add([
          k.rect(size, size),
          k.pos(x, y),
          k.color(255, 0, 0),
          k.area(),
          k.body({ isStatic: true }), // statyczne, nie podlega grawitacji
          "obstacle",
          { speed: 200 }, // px/s w lewo
        ]);

        obstacle.onUpdate(() => {
          obstacle.move(-obstacle.speed, 0);

          // jeśli przeszkoda wyleci za ekran -> usuń
          if (obstacle.pos.x + size < 0) {
            destroy(obstacle);
          }
        });

        player.onCollide("obstacle", (o) => {
          if (!o.collected) {
            // dodatkowa flaga, żeby nie liczyć wielokrotnie
            player.lives -= 1;
            livesLabel.text = `Lives: ${player.lives}`;
            o.collected = true;
            destroy(o);
          }

          if (player.lives <= 0) {
            destroy(player);
            // k.go("gameover");
          }
        });

        // losowy czas 500–1200ms
        const nextTime = 500 + Math.random() * 700;

        setTimeout(spawnObstacles, nextTime);
      }

      // start
      spawnObstacles();
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

  // if (!data) return <h1>Loading API</h1>;

  return <canvas ref={canvasRef} tabIndex={0} />;
}

export default Game;

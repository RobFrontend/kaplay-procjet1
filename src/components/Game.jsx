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

    k.loadSprite("background", "/gamebg.jpg").then(() => {
      const bg1 = k.add([
        k.sprite("background"),
        k.pos(0, 0),
        { origin: "topleft", z: -10 }, // tutaj origin w obiekcie
        // k.scale(k.width / 5600), // dopasowanie szerokości canvas
      ]);
    });

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
      // HEARTS - LIVES

      k.loadSprite("heart", "/heart.png");
      let hearts = [];
      function renderHearts(lives) {
        // delete old heart
        hearts.forEach((h) => destroy(h));
        hearts = [];

        for (let i = 0; i < lives; i++) {
          const heart = k.add([
            k.sprite("heart"),
            k.pos(20 + i * 40, 20), // każde serce przesunięte w prawo
            k.scale(0.085),
            "ui",
          ]);
          hearts.push(heart);
        }
      }
      renderHearts(player.lives);

      // BACKGROUND MOVING //
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

      // SPAWN BONUSY //
      k.loadSprite("bonusBig", "/BonusBig.png");
      k.loadSprite("bonusJump", "/BonusJump.png");
      k.loadSprite("bonusSpeed", "/BonusSpeed.png");
      function spawnBonus() {
        const types = [
          {
            tag: "orangebox",
            sprite: "bonusJump",
            effect: (player) => {
              setIsJumpPower(1200);
              setTimeout(() => setIsJumpPower(800), 7000); // 7 sekund
            },
            duration: 2,
            shape: "sprite",
          },
          {
            tag: "whitebox",
            sprite: "bonusSpeed",
            effect: (player) => {
              setIsPlayerSpeed(450);
              setTimeout(() => setIsPlayerSpeed(150), 7000);
            },
            duration: 2,
            shape: "sprite",
          },
          {
            tag: "redbox",
            sprite: "bonusBig",
            effect: (player) => {
              player.scaleTo(2);
              player.invincible = true;
              setTimeout(() => {
                player.invincible = false;
                player.scaleTo(1);
              }, 5000);
            },
            duration: 2,
            shape: "sprite",
          },
        ];

        const chosen = types[Math.floor(Math.random() * types.length)];

        let box;

        if (chosen.shape === "sprite") {
          box = k.add([
            k.sprite(chosen.sprite),
            k.pos(200 + Math.random() * 600, 0),
            k.area(),
            k.body(),
            k.anchor("center"),
            chosen.tag,
            k.scale(0.1), // możesz dostosować rozmiar BonusBig.png
          ]);
        } else {
          box = k.add([
            k.rect(60, 60),
            k.pos(200 + Math.random() * 600, 0),
            k.color(...chosen.color),
            k.area(),
            k.body(),
            k.anchor("center"),
            chosen.tag,
          ]);

          box.add([
            k.text(chosen.text, { size: 16 }),
            k.color(255, 255, 255),
            k.anchor("center"),
          ]);
        }

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
      //

      // OBSTACLES //
      k.loadSprite("obstacle", "/Obstacle.png");
      function spawnObstacles() {
        const x = 1200;
        const y = 420 + Math.random() * (300 - 30); // max 300px nad ziemią

        const obstacle = k.add([
          k.sprite("obstacle"),
          k.pos(x, y),
          k.area(),
          k.body({ isStatic: true }), // statyczne, nie podlega grawitacji
          k.scale(0.05), // dopasuj rozmiar obrazka do gry
          "obstacle",
          { speed: 200 },
        ]);

        obstacle.onUpdate(() => {
          obstacle.move(-obstacle.speed, 0);

          // jeśli przeszkoda wyleci za ekran -> usuń
          if (obstacle.pos.x < -100) {
            destroy(obstacle);
          }
        });
        //

        // PLAYER COLIDE LIVES HEART MANAGEMENT //
        player.onCollide("obstacle", (o) => {
          if (player.invincible) {
            destroy(o); // przeszkoda znika, ale nic się nie dzieje
            return;
          }

          if (!o.collected) {
            player.lives -= 1;
            renderHearts(player.lives);
            o.collected = true;
            destroy(o);
          }

          if (player.lives <= 0) {
            destroy(player);
            // k.go("gameover");
          }
        });
        //

        // losowy czas 500–1200ms
        const nextTime = 600 + Math.random() * 800;

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

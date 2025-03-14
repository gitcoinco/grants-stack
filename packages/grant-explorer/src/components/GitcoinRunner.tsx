import React, { useState, useEffect } from "react";
import { getChains, stringToBlobUrl } from "common";
import { TChain } from "common";

// Game Configuration
const GAME_CONFIG = {
  // Player settings
  player: {
    radius: 20,
    initialX: 50,
    jumpForce: -15,
    gravity: 0.6,
  },

  // Obstacle settings
  obstacles: {
    width: 40,
    minHeight: 40,
    maxNormalHeight: 60,
    minHighHeight: 100,
    maxHighHeight: 140,
    highObstacleChance: 0.4,
    minSpacing: 700,
    randomSpacingRange: 300,
  },

  // Game physics
  physics: {
    initialSpeed: 3,
    speedIncrease: 4,
    speedIncreaseRate: 500, // Lower = faster speed increase
  },

  // Scoring
  scoring: {
    obstaclePoints: 100,
    survivalPointsPerSecond: 1,
  },

  // Canvas settings
  canvas: {
    width: 400,
    height: 300,
    groundOffset: 30,
    get groundLevel() {
      return this.height - this.groundOffset;
    },
  },

  // Cooldown
  cooldown: {
    duration: 3, // seconds
  },

  powerUps: {
    width: 30,
    height: 30,
    spawnChance: 0.02,
    minSpacing: 500,
    duration: {
      shield: 5000,
      speedBoost: 3000,
      slowMotion: 3000,
      doublePoints: 5000,
      doubleJump: 7000,
    },
    effects: {
      speedBoost: 1.7, // 70% faster
      slowMotion: 0.6, // 40% slower
      doublePoints: 2, // 2x points
      baseJumpForce: -15, // Base jump force
      doubleJumpForce: -13, // Slightly weaker second jump
    },
  },
};

type Obstacle = {
  x: number;
  width: number;
  height: number;
  scored: boolean;
  iconIndex: number;
};

type PowerUpType =
  | "shield"
  | "speedBoost"
  | "slowMotion"
  | "doublePoints"
  | "doubleJump";

type PowerUp = {
  type: PowerUpType;
  x: number;
  active: boolean;
  collected: boolean;
};

type CollectionEffect = {
  type: PowerUpType | "score";
  x: number;
  y: number;
  timeLeft: number;
  text?: string; // Optional text for score effects
};

// Add type definitions for collision boxes
type CollisionBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export function GitcoinRunner() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(3);
  const playerRef = React.useRef({
    x: GAME_CONFIG.player.initialX,
    y: 250,
    dy: 0,
    radius: GAME_CONFIG.player.radius,
    isJumping: false,
    hasDoubleJump: false,
    hasShield: false,
  });
  const gameStateRef = React.useRef({
    gameSpeed: GAME_CONFIG.physics.initialSpeed,
    frameCount: 0,
  });
  const obstaclesRef = React.useRef<Obstacle[]>([]);
  const playerImageRef = React.useRef<HTMLImageElement | null>(null);
  const chainIconsRef = React.useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const powerUpsRef = React.useRef<PowerUp[]>([]);
  const [activeEffects, setActiveEffects] = useState<Set<PowerUpType>>(
    new Set()
  );
  const collectionEffectsRef = React.useRef<CollectionEffect[]>([]);
  const shieldEffectRef = React.useRef({
    active: false,
    timeLeft: 0,
  });

  function startJump() {
    const player = playerRef.current;

    if (
      !player.isJumping ||
      (activeEffects.has("doubleJump") && !player.hasDoubleJump)
    ) {
      // Calculate base jump force
      const baseJumpForce = !player.isJumping
        ? GAME_CONFIG.powerUps.effects.baseJumpForce
        : GAME_CONFIG.powerUps.effects.doubleJumpForce;

      // Apply the jump force
      player.dy = baseJumpForce;

      if (player.isJumping) {
        // This is a double jump
        player.hasDoubleJump = true; // Mark double jump as used
        collectionEffectsRef.current.push({
          type: "doubleJump",
          x: player.x,
          y: player.y - player.radius,
          timeLeft: 45,
          text: "↑↑ Double Jump!",
        });
      }

      player.isJumping = true;
    }
  }

  function resetGame() {
    const player = playerRef.current;
    const gameState = gameStateRef.current;

    setGameOver(false);
    setScore(0);
    setSurvivalTime(0);
    player.y = canvasRef.current
      ? canvasRef.current.height - 50 - player.radius
      : 250;
    player.dy = 0;
    player.isJumping = false;
    player.hasShield = false;
    player.hasDoubleJump = false;
    setActiveEffects(new Set());
    gameState.gameSpeed = GAME_CONFIG.physics.initialSpeed;
    gameState.frameCount = 0;
    obstaclesRef.current = [];
    powerUpsRef.current = [];
    collectionEffectsRef.current = [];
    setGameStarted(true);
  }

  function createObstacle() {
    const width = GAME_CONFIG.obstacles.width;
    const isHighObstacle =
      Math.random() < GAME_CONFIG.obstacles.highObstacleChance;
    const height = isHighObstacle
      ? GAME_CONFIG.obstacles.minHighHeight +
        Math.random() *
          (GAME_CONFIG.obstacles.maxHighHeight -
            GAME_CONFIG.obstacles.minHighHeight)
      : GAME_CONFIG.obstacles.minHeight +
        Math.random() *
          (GAME_CONFIG.obstacles.maxNormalHeight -
            GAME_CONFIG.obstacles.minHeight);
    const iconIndex = Math.floor(Math.random() * chainIconsRef.current.length);

    obstaclesRef.current.push({
      x: canvasRef.current?.width || 0,
      width,
      height,
      scored: false,
      iconIndex,
    });
  }

  function createPowerUp() {
    const types: PowerUpType[] = [
      "shield",
      "speedBoost",
      "slowMotion",
      "doublePoints",
      "doubleJump",
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    powerUpsRef.current.push({
      type,
      x: canvasRef.current?.width || 0,
      active: false,
      collected: false,
    });
  }

  function collectPowerUp(powerUp: PowerUp) {
    if (powerUp.collected) return;
    powerUp.collected = true;

    // Clear any conflicting effects first
    if (powerUp.type === "speedBoost" || powerUp.type === "slowMotion") {
      setActiveEffects((prev) => {
        const next = new Set(prev);
        next.delete("speedBoost");
        next.delete("slowMotion");
        return next;
      });
    }

    switch (powerUp.type) {
      case "shield":
        playerRef.current.hasShield = true;
        break;
      case "doubleJump":
        playerRef.current.hasDoubleJump = true;
        break;
      case "speedBoost":
      case "slowMotion":
      case "doublePoints":
        setActiveEffects((prev) => new Set(prev).add(powerUp.type));
        setTimeout(() => {
          setActiveEffects((prev) => {
            const next = new Set(prev);
            next.delete(powerUp.type);
            return next;
          });
        }, GAME_CONFIG.powerUps.duration[powerUp.type]);
        break;
    }

    // Add collection effect text
    collectionEffectsRef.current.push({
      type: powerUp.type,
      x: powerUp.x,
      y: GAME_CONFIG.canvas.groundLevel - 50,
      timeLeft: 60,
    });
  }

  useEffect(() => {
    if (!canvasRef.current || !imagesLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const player = playerRef.current;
    const obstacles = obstaclesRef.current;
    const gameState = gameStateRef.current;
    let animationId: number;
    const gravity = GAME_CONFIG.player.gravity;

    function drawGround(context: CanvasRenderingContext2D) {
      context.strokeStyle = "#666";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, GAME_CONFIG.canvas.groundLevel);
      context.lineTo(canvas.width, GAME_CONFIG.canvas.groundLevel);
      context.stroke();
    }

    function drawPlayer(context: CanvasRenderingContext2D) {
      if (playerImageRef.current) {
        const size = player.radius * 2;

        // Draw shield effect if active
        if (playerRef.current.hasShield) {
          context.save();
          context.beginPath();
          context.arc(player.x, player.y, player.radius + 5, 0, Math.PI * 2);
          context.strokeStyle = getPowerUpColor("shield");
          context.lineWidth = 3;
          context.stroke();
          context.restore();
        }

        // Draw player
        context.drawImage(
          playerImageRef.current,
          player.x - size / 2,
          player.y - size / 2,
          size,
          size
        );
      }
    }

    function drawObstacles(context: CanvasRenderingContext2D) {
      obstacles.forEach((obstacle) => {
        const icon = chainIconsRef.current[obstacle.iconIndex];
        if (icon) {
          context.drawImage(
            icon,
            obstacle.x,
            GAME_CONFIG.canvas.groundLevel - obstacle.height,
            obstacle.width,
            obstacle.width
          );
        }
      });
    }

    function drawPowerUps(context: CanvasRenderingContext2D) {
      powerUpsRef.current.forEach((powerUp) => {
        if (powerUp.collected) return;

        // Draw glowing effect
        context.save();
        context.shadowColor = getPowerUpColor(powerUp.type);
        context.shadowBlur = 10;

        // Draw power-up circle
        context.fillStyle = getPowerUpColor(powerUp.type);
        context.beginPath();
        context.arc(
          powerUp.x + GAME_CONFIG.powerUps.width / 2,
          GAME_CONFIG.canvas.groundLevel - GAME_CONFIG.powerUps.height / 2,
          GAME_CONFIG.powerUps.width / 2,
          0,
          Math.PI * 2
        );
        context.fill();

        // Draw symbol
        context.fillStyle = "white";
        context.font = "bold 16px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(
          getPowerUpSymbol(powerUp.type),
          powerUp.x + GAME_CONFIG.powerUps.width / 2,
          GAME_CONFIG.canvas.groundLevel - GAME_CONFIG.powerUps.height / 2
        );

        context.restore();
      });
    }

    function drawPowerUpStatus(context: CanvasRenderingContext2D) {
      const effects = [
        {
          type: "shield",
          active: playerRef.current.hasShield,
          text: "🛡️ Shield - Blocks next hit",
        },
        {
          type: "doubleJump",
          active: playerRef.current.hasDoubleJump,
          text: "↑↑ Double Jump Ready",
        },
        {
          type: "speedBoost",
          active: activeEffects.has("speedBoost"),
          text: "⚡ Speed Boost",
        },
        {
          type: "slowMotion",
          active: activeEffects.has("slowMotion"),
          text: "⏰ Slow Motion",
        },
        {
          type: "doublePoints",
          active: activeEffects.has("doublePoints"),
          text: "×2 Double Points",
        },
      ];

      const activeEffectsList = effects.filter((effect) => effect.active);

      if (activeEffectsList.length > 0) {
        // Draw semi-transparent background
        context.fillStyle = "rgba(255, 255, 255, 0.9)";
        context.fillRect(
          canvas.width - 200,
          10,
          190,
          25 * activeEffectsList.length + 10
        );

        // Draw effects list
        context.textAlign = "left";
        context.font = "16px Arial";
        activeEffectsList.forEach((effect, index) => {
          context.fillStyle = getPowerUpColor(effect.type as PowerUpType);
          context.fillText(effect.text, canvas.width - 190, 30 + index * 25);
        });
      }
    }

    function checkCollision() {
      if (playerRef.current.hasShield) {
        const collision = obstacles.some((obstacle) => {
          const playerBox = {
            left: playerRef.current.x - playerRef.current.radius,
            right: playerRef.current.x + playerRef.current.radius,
            top: playerRef.current.y - playerRef.current.radius,
            bottom: playerRef.current.y + playerRef.current.radius,
          };

          const obstacleBox = {
            left: obstacle.x,
            right: obstacle.x + obstacle.width,
            top: GAME_CONFIG.canvas.groundLevel - obstacle.height,
            bottom: GAME_CONFIG.canvas.groundLevel,
          };

          return checkBoxCollision(
            playerBox,
            obstacleBox,
            obstacle.height > GAME_CONFIG.obstacles.maxNormalHeight
          );
        });

        if (collision) {
          playerRef.current.hasShield = false;
          collectionEffectsRef.current.push({
            type: "shield",
            x: playerRef.current.x,
            y: playerRef.current.y - playerRef.current.radius,
            timeLeft: 45,
            text: "Shield Broken!",
          });
          return false;
        }
        return false;
      }

      return obstacles.some((obstacle) => {
        const playerBox = {
          left: playerRef.current.x - playerRef.current.radius,
          right: playerRef.current.x + playerRef.current.radius,
          top: playerRef.current.y - playerRef.current.radius,
          bottom: playerRef.current.y + playerRef.current.radius,
        };

        const obstacleBox = {
          left: obstacle.x,
          right: obstacle.x + obstacle.width,
          top: GAME_CONFIG.canvas.groundLevel - obstacle.height,
          bottom: GAME_CONFIG.canvas.groundLevel,
        };

        return checkBoxCollision(
          playerBox,
          obstacleBox,
          obstacle.height > GAME_CONFIG.obstacles.maxNormalHeight
        );
      });
    }

    function updateGameState() {
      if (!gameStarted || gameOver) return;

      // Calculate base game speed
      const baseSpeed =
        GAME_CONFIG.physics.initialSpeed +
        Math.min(
          gameState.frameCount / GAME_CONFIG.physics.speedIncreaseRate,
          GAME_CONFIG.physics.speedIncrease
        );

      gameState.gameSpeed = baseSpeed;
      gameState.frameCount++;
    }

    function updateScore(basePoints: number): number {
      if (activeEffects.has("doublePoints")) {
        return basePoints * GAME_CONFIG.powerUps.effects.doublePoints;
      }
      return basePoints;
    }

    function drawEffects(context: CanvasRenderingContext2D) {
      // Draw shield effect
      if (playerRef.current.hasShield) {
        context.save();
        context.beginPath();
        context.arc(
          playerRef.current.x,
          playerRef.current.y,
          playerRef.current.radius + 5,
          0,
          Math.PI * 2
        );
        // Animated shield effect
        const gradient = context.createRadialGradient(
          playerRef.current.x,
          playerRef.current.y,
          playerRef.current.radius,
          playerRef.current.x,
          playerRef.current.y,
          playerRef.current.radius + 5
        );
        gradient.addColorStop(0, "rgba(76, 175, 80, 0)");
        gradient.addColorStop(1, "rgba(76, 175, 80, 0.5)");
        context.fillStyle = gradient;
        context.fill();
        context.restore();
      }

      // Draw speed effect
      if (activeEffects.has("speedBoost")) {
        context.save();
        context.fillStyle = "rgba(33, 150, 243, 0.3)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        // Add speed lines
        for (let i = 0; i < 10; i++) {
          context.beginPath();
          context.moveTo(Math.random() * canvas.width, 0);
          context.lineTo(Math.random() * canvas.width - 50, canvas.height);
          context.strokeStyle = "rgba(33, 150, 243, 0.2)";
          context.stroke();
        }
        context.restore();
      }

      // Draw slow motion effect
      if (activeEffects.has("slowMotion")) {
        context.save();
        context.fillStyle = "rgba(156, 39, 176, 0.2)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
      }

      // Draw double points effect
      if (activeEffects.has("doublePoints")) {
        context.save();
        context.fillStyle = "rgba(255, 193, 7, 0.2)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw effects first (background layer)
      drawEffects(ctx);

      drawGround(ctx);
      drawPowerUps(ctx);
      drawPlayer(ctx);
      if (gameStarted) {
        drawObstacles(ctx);
      }

      // Draw power-up collection effects
      collectionEffectsRef.current = collectionEffectsRef.current.filter(
        (effect) => {
          if (effect.timeLeft <= 0) return false;

          ctx.save();
          ctx.fillStyle =
            effect.type === "score"
              ? "#333"
              : getPowerUpColor(effect.type as PowerUpType);
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            effect.type === "score"
              ? effect.text!
              : `+ ${getPowerUpName(effect.type as PowerUpType)}!`,
            effect.x,
            effect.y
          );
          ctx.restore();

          effect.timeLeft--;
          effect.y--; // Float up effect
          return true;
        }
      );

      // Draw score during gameplay
      ctx.fillStyle = "#333";
      ctx.font = "24px Arial";
      ctx.textAlign = "left";
      if (!gameOver && gameStarted) {
        ctx.fillText(`Score: ${score}`, 10, 30);
      }

      // Draw start screen
      if (!gameStarted && !gameOver) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title with glow
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 200, 255, 0.3)";
        ctx.shadowBlur = 15;
        ctx.font = "bold 36px Arial";
        ctx.fillText("Chain Hopper", canvas.width / 2, canvas.height / 2 - 20);

        // Instructions
        ctx.shadowBlur = 5;
        ctx.font = "20px Arial";
        ctx.fillStyle = "#333333";
        ctx.fillText(
          "Jump across the chains!",
          canvas.width / 2,
          canvas.height / 2 + 10
        );
        ctx.font = "16px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText(
          "Press spacebar or tap to play",
          canvas.width / 2,
          canvas.height / 2 + 40
        );

        // Reset shadow
        ctx.shadowBlur = 0;
      }

      // Draw game over screen
      if (gameOver) {
        // Light background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw score box with subtle gradient
        const gradient = ctx.createLinearGradient(
          0,
          canvas.height / 2 - 100,
          0,
          canvas.height / 2 + 100
        );
        gradient.addColorStop(0, "rgba(0, 200, 255, 0.1)");
        gradient.addColorStop(1, "rgba(0, 200, 255, 0.05)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
          canvas.width / 2 - 150,
          canvas.height / 2 - 80,
          300,
          160,
          10
        );
        ctx.fill();

        // Game over text with shadow
        ctx.fillStyle = "#000000";
        ctx.shadowColor = "rgba(0, 200, 255, 0.3)";
        ctx.shadowBlur = 10;
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 30);

        // Score with subtle glow
        ctx.shadowBlur = 5;
        ctx.font = "28px Arial";
        ctx.fillStyle = "#333333";
        ctx.fillText(
          `Score: ${score}`,
          canvas.width / 2,
          canvas.height / 2 + 10
        );

        // Reset shadow
        ctx.shadowBlur = 0;

        if (cooldown) {
          ctx.font = "16px Arial";
          ctx.fillStyle = "#666666";
          ctx.fillText(
            `Wait ${cooldownTime} seconds...`,
            canvas.width / 2,
            canvas.height / 2 + 50
          );
        } else {
          ctx.font = "18px Arial";
          ctx.fillStyle = "#666666";
          ctx.fillText(
            "Press space to play again",
            canvas.width / 2,
            canvas.height / 2 + 50
          );
        }
      }

      // Draw active power-ups status
      if (gameStarted && !gameOver) {
        drawPowerUpStatus(ctx);
      }

      if (gameStarted && !gameOver) {
        // Add survival points (near the start of the game loop)
        if (gameState.frameCount % 60 === 0) {
          // Every 60 frames (roughly 1 second)
          const survivalPoints = updateScore(
            GAME_CONFIG.scoring.survivalPointsPerSecond
          );
          setScore((prev) => prev + survivalPoints);
          setSurvivalTime((prev) => prev + 1);
        }

        // Calculate speed multiplier
        let speedMultiplier = 1;
        if (activeEffects.has("speedBoost")) {
          speedMultiplier = GAME_CONFIG.powerUps.effects.speedBoost;
        } else if (activeEffects.has("slowMotion")) {
          speedMultiplier = GAME_CONFIG.powerUps.effects.slowMotion;
        }

        // Apply gravity and movement
        player.dy += GAME_CONFIG.player.gravity;
        player.y += player.dy * speedMultiplier;

        // Ground collision
        if (player.y >= GAME_CONFIG.canvas.groundLevel - player.radius) {
          player.y = GAME_CONFIG.canvas.groundLevel - player.radius;
          player.dy = 0;
          player.isJumping = false;
        }

        // Move obstacles
        obstacles.forEach((obstacle) => {
          obstacle.x -= gameState.gameSpeed * speedMultiplier;
        });

        // Check for scoring
        obstacles.forEach((obstacle) => {
          if (!obstacle.scored && player.x > obstacle.x + obstacle.width) {
            obstacle.scored = true;
            const points = updateScore(GAME_CONFIG.scoring.obstaclePoints);
            setScore((prev) => prev + points);

            collectionEffectsRef.current.push({
              type: "score",
              x: obstacle.x + obstacle.width,
              y: GAME_CONFIG.canvas.groundLevel - 50,
              timeLeft: 30,
              text: `+${points}`,
            });
          }
        });

        // Remove and spawn obstacles
        while (obstacles.length > 0 && obstacles[0].x < -obstacles[0].width) {
          obstacles.shift();
        }

        if (
          obstacles.length === 0 ||
          obstacles[obstacles.length - 1].x <
            canvas.width - GAME_CONFIG.obstacles.minSpacing
        ) {
          createObstacle();
        }

        // Check collisions
        const hasCollided = checkCollision();
        if (hasCollided) {
          setGameOver(true);
          setGameStarted(false);
          setCooldown(true);
          setCooldownTime(3);
          const timer = setInterval(() => {
            setCooldownTime((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                setCooldown(false);
                return 3;
              }
              return prev - 1;
            });
          }, 1000);
          return;
        }

        // Update power-ups
        powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
          if (powerUp.collected) return true;
          powerUp.x -= gameState.gameSpeed * speedMultiplier;
          return powerUp.x > -GAME_CONFIG.powerUps.width;
        });

        if (
          Math.random() < GAME_CONFIG.powerUps.spawnChance &&
          (powerUpsRef.current.length === 0 ||
            powerUpsRef.current[powerUpsRef.current.length - 1].x <
              canvas.width - GAME_CONFIG.powerUps.minSpacing)
        ) {
          createPowerUp();
        }

        // Check power-up collisions
        powerUpsRef.current.forEach((powerUp) => {
          if (!powerUp.collected && checkPowerUpCollision(powerUp)) {
            collectPowerUp(powerUp);
          }
        });

        updateGameState();
      }

      animationId = requestAnimationFrame(draw);
    }

    // Start the game loop
    draw();

    // Handle keyboard events
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        event.preventDefault();
        if ((gameOver || !gameStarted) && !cooldown) {
          resetGame();
        } else {
          startJump();
        }
      }
    }

    // Handle touch/click events
    function handleTouchStart(event: TouchEvent | MouseEvent) {
      event.preventDefault();
      if ((gameOver || !gameStarted) && !cooldown) {
        resetGame();
      } else {
        startJump();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("mousedown", handleTouchStart);
    canvas.addEventListener("touchstart", handleTouchStart);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("mousedown", handleTouchStart);
      canvas.removeEventListener("touchstart", handleTouchStart);
    };
  }, [
    gameOver,
    score,
    gameStarted,
    survivalTime,
    imagesLoaded,
    cooldown,
    cooldownTime,
  ]);

  useEffect(() => {
    // Load player image
    const playerImg = new Image();
    playerImg.src = "/logos/gitcoin-gist-logo.svg";
    playerImg.onerror = (e) => {
      console.error("Failed to load player image:", e);
    };
    playerImg.onload = () => {
      console.log("Player image loaded successfully");
      playerImageRef.current = playerImg;
      checkAllImagesLoaded();
    };

    // Load chain icons
    const mainnetChains = getChains().filter(
      (chain: TChain) => chain.type === "mainnet"
    );
    console.log("Found mainnet chains:", mainnetChains.length);

    const chainImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    mainnetChains.forEach((chain: TChain) => {
      const img = new Image();
      img.src = stringToBlobUrl(chain.icon);
      img.onerror = (e) => {
        console.error("Failed to load chain icon:", chain.name, e);
      };
      img.onload = () => {
        console.log("Chain icon loaded:", chain.name);
        loadedCount++;
        chainImages.push(img);
        if (loadedCount === mainnetChains.length) {
          chainIconsRef.current = chainImages;
          checkAllImagesLoaded();
        }
      };
    });

    function checkAllImagesLoaded() {
      console.log("Checking images:", {
        playerImage: !!playerImageRef.current,
        chainIcons: chainIconsRef.current.length,
      });
      if (playerImageRef.current && chainIconsRef.current.length > 0) {
        setImagesLoaded(true);
      }
    }
  }, []);

  // Add console logs to debug
  useEffect(() => {
    console.log("Images loaded:", imagesLoaded);
    console.log("Player image:", playerImageRef.current);
    console.log("Chain icons:", chainIconsRef.current);
  }, [imagesLoaded]);

  // Make sure the game actually starts
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx && imagesLoaded && !gameStarted && !gameOver) {
      console.log("Game ready to start");
      ctx.fillStyle = "#4CAF50";
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

      if (playerImageRef.current) {
        const size = playerRef.current.radius * 2;
        ctx.drawImage(
          playerImageRef.current,
          playerRef.current.x - size / 2,
          playerRef.current.y - size / 2,
          size,
          size
        );
      }
    }
  }, [imagesLoaded, gameStarted, gameOver]);

  // Add helper functions
  function getPowerUpColor(type: PowerUpType): string {
    switch (type) {
      case "shield":
        return "#4CAF50";
      case "speedBoost":
        return "#2196F3";
      case "slowMotion":
        return "#9C27B0";
      case "doublePoints":
        return "#FFC107";
      case "doubleJump":
        return "#F44336";
    }
  }

  function getPowerUpSymbol(type: PowerUpType): string {
    switch (type) {
      case "shield":
        return "🛡️";
      case "speedBoost":
        return "⚡";
      case "slowMotion":
        return "⏰";
      case "doublePoints":
        return "×2";
      case "doubleJump":
        return "↑↑";
    }
  }

  function checkPowerUpCollision(powerUp: PowerUp): boolean {
    const playerBox = {
      left: playerRef.current.x - playerRef.current.radius,
      right: playerRef.current.x + playerRef.current.radius,
      top: playerRef.current.y - playerRef.current.radius,
      bottom: playerRef.current.y + playerRef.current.radius,
    };

    const powerUpBox = {
      left: powerUp.x,
      right: powerUp.x + GAME_CONFIG.powerUps.width,
      top: GAME_CONFIG.canvas.groundLevel - GAME_CONFIG.powerUps.height,
      bottom: GAME_CONFIG.canvas.groundLevel,
    };

    return (
      playerBox.right > powerUpBox.left &&
      playerBox.left < powerUpBox.right &&
      playerBox.bottom > powerUpBox.top &&
      playerBox.top < powerUpBox.bottom
    );
  }

  function getPowerUpName(type: PowerUpType): string {
    switch (type) {
      case "shield":
        return "Shield";
      case "speedBoost":
        return "Speed Boost";
      case "slowMotion":
        return "Slow Motion";
      case "doublePoints":
        return "Double Points";
      case "doubleJump":
        return "Double Jump";
    }
  }

  // Helper function to check collision between boxes
  function checkBoxCollision(
    player: CollisionBox,
    obstacle: CollisionBox,
    isHighObstacle: boolean
  ): boolean {
    const horizontalOverlap =
      player.right > obstacle.left && player.left < obstacle.right;

    if (!horizontalOverlap) return false;

    if (isHighObstacle) {
      return player.bottom > obstacle.top && player.top < obstacle.top;
    }

    return player.bottom > obstacle.top;
  }

  // Add a debug render to see what's happening
  if (!imagesLoaded) {
    return (
      <div className="text-center p-4">
        <p>Loading game assets...</p>
        <p className="text-sm text-gray-500">
          Player image: {playerImageRef.current ? "Loaded" : "Loading"}
        </p>
        <p className="text-sm text-gray-500">
          Chain icons: {chainIconsRef.current.length} loaded
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.canvas.width}
        height={GAME_CONFIG.canvas.height}
        className="mx-auto border rounded-lg cursor-pointer"
      />
    </div>
  );
}

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
    speedIncreaseRate: 1000, // Lower = faster speed increase
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
  },

  // Cooldown
  cooldown: {
    duration: 3, // seconds
  },
};

type Obstacle = {
  x: number;
  width: number;
  height: number;
  scored: boolean;
  iconIndex: number;
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
  });
  const gameStateRef = React.useRef({
    gameSpeed: GAME_CONFIG.physics.initialSpeed,
    frameCount: 0,
  });
  const obstaclesRef = React.useRef<Obstacle[]>([]);
  const playerImageRef = React.useRef<HTMLImageElement | null>(null);
  const chainIconsRef = React.useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  function startJump() {
    const player = playerRef.current;
    if (!player.isJumping) {
      player.dy = GAME_CONFIG.player.jumpForce;
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
    gameState.gameSpeed = GAME_CONFIG.physics.initialSpeed;
    gameState.frameCount = 0;
    obstaclesRef.current = [];
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
    const groundLevel = canvas.height - GAME_CONFIG.canvas.groundOffset;

    function drawGround(context: CanvasRenderingContext2D) {
      context.strokeStyle = "#666";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, groundLevel);
      context.lineTo(canvas.width, groundLevel);
      context.stroke();
    }

    function drawPlayer(context: CanvasRenderingContext2D) {
      if (playerImageRef.current) {
        const size = player.radius * 2;
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
            groundLevel - obstacle.height,
            obstacle.width,
            obstacle.width
          );
        }
      });
    }

    function checkCollision() {
      return obstacles.some((obstacle) => {
        const playerBox = {
          left: player.x - player.radius,
          right: player.x + player.radius,
          top: player.y - player.radius,
          bottom: player.y + player.radius,
        };

        const obstacleBox = {
          left: obstacle.x,
          right: obstacle.x + obstacle.width,
          top: groundLevel - obstacle.height,
          bottom: groundLevel,
        };

        // Check for horizontal overlap
        const horizontalOverlap =
          playerBox.right > obstacleBox.left &&
          playerBox.left < obstacleBox.right;

        // If there's horizontal overlap, check for collision
        if (horizontalOverlap) {
          // For high obstacles (that can be passed under)
          if (obstacle.height > GAME_CONFIG.obstacles.maxNormalHeight) {
            // Only collide if we hit the top portion
            return (
              playerBox.bottom > obstacleBox.top &&
              playerBox.top < obstacleBox.top
            );
          } else {
            // For normal obstacles, collide if there's any vertical overlap
            return playerBox.bottom > obstacleBox.top;
          }
        }

        return false;
      });
    }

    function updateScore() {
      obstacles.forEach((obstacle) => {
        if (!obstacle.scored && player.x > obstacle.x + obstacle.width) {
          obstacle.scored = true;
          setScore((prev) => prev + GAME_CONFIG.scoring.obstaclePoints);
        }
      });

      if (gameStarted && !gameOver) {
        gameState.frameCount++;
        if (gameState.frameCount % 60 === 0) {
          setSurvivalTime(gameState.frameCount / 60);
          setScore(
            (prev) => prev + GAME_CONFIG.scoring.survivalPointsPerSecond
          );
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGround(ctx);
      drawPlayer(ctx);
      if (gameStarted) {
        drawObstacles(ctx);
      }

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

      if (gameStarted && !gameOver) {
        player.dy += gravity;
        player.y = Math.min(player.y + player.dy, groundLevel - player.radius);

        // Check if player landed
        if (player.y >= groundLevel - player.radius) {
          player.y = groundLevel - player.radius;
          player.dy = 0;
          player.isJumping = false;
        }

        // Update game speed
        gameState.gameSpeed =
          GAME_CONFIG.physics.initialSpeed +
          Math.min(
            gameState.frameCount / GAME_CONFIG.physics.speedIncreaseRate,
            GAME_CONFIG.physics.speedIncrease
          );

        // Update obstacles
        obstacles.forEach((obstacle) => {
          obstacle.x -= gameState.gameSpeed;
        });

        // Remove off-screen obstacles
        while (obstacles.length > 0 && obstacles[0].x < -obstacles[0].width) {
          obstacles.shift();
        }

        // Add new obstacles with randomized spacing
        if (
          obstacles.length === 0 ||
          obstacles[obstacles.length - 1].x <
            canvas.width -
              (GAME_CONFIG.obstacles.minSpacing +
                Math.random() * GAME_CONFIG.obstacles.randomSpacingRange)
        ) {
          createObstacle();
        }

        if (checkCollision()) {
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

        updateScore();
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

document.addEventListener("DOMContentLoaded", function (e) {
  enum snakeDirection {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
  }

  interface ISnakeCellPosition {
    x: number;
    y: number;
    direction: snakeDirection;
  }

  interface IGameLvl {
    [key: string]: {
      speed: number;
      score: [number, number];
    };
  }

  let score: number = 0;
  let speed: number = 1000;
  const snakeDefaultLength: number = 4;

  const gameLvl: IGameLvl = {
    easy: {
      speed: 1000,
      score: [0, 40],
    },
    medium: {
      speed: 800,
      score: [50, 90],
    },
    hard: {
      speed: 600,
      score: [100, 140],
    },
    impossible: {
      speed: 400,
      score: [140, 1000],
    },
  };

  const initialFieldRows: number = 16;
  const initialFieldCols: number = 16;
  const snakeColor: string = "#32CD32";
  const clearCellColor: string = "#ffffff";
  const goalColor: string = "#20B2AA";

  let snakeTimerId: ReturnType<typeof setInterval>;
  let isGameStarted: boolean = false;
  let initialDirection: snakeDirection = snakeDirection.UP;

  const snakeContainer: HTMLDivElement | null =
    document.querySelector("#snake");

  const renderSnake = (snake: ISnakeCellPosition[]) => {
    snake.forEach(({ x, y }) => {
      const element: HTMLElement | null = document.querySelector(
        `.cell[data-x="${x}"][data-y="${y}"]`
      );

      if (element) {
        element.style.backgroundColor = snakeColor;
      }
    });
  };

  const clearLeftCell = () => {
    const cells: HTMLElement[] = Array.from(
      document.querySelectorAll(".cell:not([data-goal])")
    );

    cells.forEach(
      (element) => (element.style.backgroundColor = clearCellColor)
    );
  };

  const generateField = (rows: number, cols: number) => {
    const fieldContainer: HTMLDivElement = document.createElement("div");
    fieldContainer.classList.add("fieldContainer");
    fieldContainer.style.width = rows * 22 + "px"; // 22 is 20px cell width + 2px left and right border

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell: HTMLDivElement = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = i + "";
        cell.dataset.y = j + "";

        fieldContainer.appendChild(cell);
      }
    }

    snakeContainer?.appendChild(fieldContainer);
  };

  const initiateSnake = (
    len: number,
    direction: snakeDirection,
    initialFieldRows: number,
    initialFieldCols: number
  ): ISnakeCellPosition[] => {
    const headPosition: ISnakeCellPosition = {
      x: Math.floor(initialFieldRows / 2),
      y: Math.floor(initialFieldCols / 2),
      direction,
    };
    let snake: ISnakeCellPosition[] = [headPosition];

    const lenAsArr: number[] = Array.from({ length: len - 1 });

    switch (direction) {
      case snakeDirection.UP: {
        lenAsArr.forEach((_, i) => {
          const elementPosition: ISnakeCellPosition = {
            x: headPosition.x + i + 1,
            y: headPosition.y,
            direction,
          };
          snake.push(elementPosition);
        });
        break;
      }
      case snakeDirection.DOWN: {
        lenAsArr.forEach((_, i) => {
          const elementPosition: ISnakeCellPosition = {
            x: headPosition.x - i - 1,
            y: headPosition.y,
            direction,
          };
          snake.push(elementPosition);
        });
        break;
      }
      case snakeDirection.LEFT: {
        lenAsArr.forEach((_, i) => {
          const elementPosition: ISnakeCellPosition = {
            x: headPosition.x,
            y: headPosition.y + i + 1,
            direction,
          };
          snake.push(elementPosition);
        });
        break;
      }
      case snakeDirection.RIGHT: {
        lenAsArr.forEach((_, i) => {
          const elementPosition: ISnakeCellPosition = {
            x: headPosition.x,
            y: headPosition.y - i - 1,
            direction,
          };
          snake.push(elementPosition);
        });
        break;
      }
    }

    renderSnake(snake);
    return snake;
  };

  const generateGoal = (
    initialFieldRows: number,
    initialFieldCols: number,
    snake: ISnakeCellPosition[]
  ) => {
    let xGoal: number;
    let yGoal: number;
    let isCoordsExist: ISnakeCellPosition | undefined;

    const existGoal: HTMLElement | null = document.querySelector(
      `.cell[data-goal=goal]`
    );

    if (existGoal) {
      existGoal.style.backgroundColor = clearCellColor;
      existGoal.removeAttribute("data-goal");
    }

    do {
      xGoal = Math.floor(Math.random() * initialFieldRows);
      yGoal = Math.floor(Math.random() * initialFieldCols);

      isCoordsExist = snake.find(({ x, y }) => x === xGoal && y === yGoal);
    } while (isCoordsExist);

    const element: HTMLElement | null = document.querySelector(
      `.cell[data-x="${xGoal}"][data-y="${yGoal}"]`
    );

    if (element) {
      element.style.backgroundColor = goalColor;
      element.dataset.goal = "goal";
    }
  };

  const startGame = (e: MouseEvent | null) => {
    generateGoal(initialFieldRows, initialFieldCols, snake);

    if (isGameStarted) return;
    isGameStarted = true;

    snakeTimerId = setInterval(() => {
      const newPositions = snake.map(({ x, y, direction }) => {
        switch (direction) {
          case snakeDirection.UP: {
            const v = x - 1;
            const elementPosition: ISnakeCellPosition = {
              x: v < 0 ? initialFieldRows - 1 : v,
              y: y,
              direction,
            };
            return elementPosition;
          }
          case snakeDirection.DOWN: {
            const v = x + 1;
            const elementPosition: ISnakeCellPosition = {
              x: v > initialFieldRows - 1 ? 0 : v,
              y: y,
              direction,
            };
            return elementPosition;
          }
          case snakeDirection.RIGHT: {
            const v = y + 1;
            const elementPosition: ISnakeCellPosition = {
              x: x,
              y: v > initialFieldCols - 1 ? 0 : v,
              direction,
            };
            return elementPosition;
          }
          case snakeDirection.LEFT: {
            const v = y - 1;
            const elementPosition: ISnakeCellPosition = {
              x: x,
              y: v < 0 ? initialFieldCols - 1 : v,
              direction,
            };
            return elementPosition;
          }
        }
      });

      snake = snakeIntersection(getGoal(newPositions));
      clearLeftCell();
      renderSnake(snake);
      snake = updateSnakeCellDirection(snake);

      updateSnakeSpeed(score, gameLvl);
    }, speed);
  };

  const snakeIntersection = (
    snake: ISnakeCellPosition[]
  ): ISnakeCellPosition[] => {
    const head: ISnakeCellPosition = snake[0];

    const intersection = snake
      .slice(1)
      .findIndex(({ x, y }) => x === head.x && y === head.y);

    if (intersection > 0) {
      const newSnake = snake.slice(0, intersection + 1);
      const newSnakeScore = newSnake.length - snakeDefaultLength;
      score = newSnakeScore;

      generateScore(score);
      updateSnakeSpeed(score, gameLvl);

      return newSnake;
    }

    return snake;
  };

  const updateSnakeSpeed = (score: number, gameLvl: IGameLvl) => {
    const newLvl = Object.values(gameLvl).find(
      ({ score: lvlScore }) => lvlScore[0] <= score && score <= lvlScore[1]
    );
    const newSpeed: number | undefined = newLvl?.speed;

    if (newSpeed && newSpeed !== speed) {
      speed = newSpeed;
      const startGameBtn: HTMLButtonElement | null =
        document.querySelector("#start");

      if (startGameBtn) {
        stopGame();
        startGameBtn.click();
      }
    }
  };

  const getGoal = (snake: ISnakeCellPosition[]): ISnakeCellPosition[] => {
    const copy: ISnakeCellPosition[] = JSON.parse(JSON.stringify(snake));
    const head: ISnakeCellPosition = copy[0];

    const element: HTMLElement | null = document.querySelector(
      `.cell[data-x="${head.x}"][data-y="${head.y}"][data-goal]`
    );

    if (element) {
      score += 10;
      generateScore(score);

      const {
        x,
        y,
        direction: tailDirection,
      } = copy.at(-1) as ISnakeCellPosition;

      switch (tailDirection) {
        case snakeDirection.UP: {
          const v = x + 1;
          const elementPosition: ISnakeCellPosition = {
            x: v < 0 ? initialFieldRows - 1 : v,
            y: y,
            direction: tailDirection,
          };
          copy.push(elementPosition);
          break;
        }
        case snakeDirection.DOWN: {
          const v = x - 1;
          const elementPosition: ISnakeCellPosition = {
            x: v > initialFieldRows - 1 ? 0 : v,
            y: y,
            direction: tailDirection,
          };
          copy.push(elementPosition);
          break;
        }
        case snakeDirection.RIGHT: {
          const v = y - 1;
          const elementPosition: ISnakeCellPosition = {
            x: x,
            y: v > initialFieldCols - 1 ? 0 : v,
            direction: tailDirection,
          };
          copy.push(elementPosition);
          break;
        }
        case snakeDirection.LEFT: {
          const v = y + 1;
          const elementPosition: ISnakeCellPosition = {
            x: x,
            y: v < 0 ? initialFieldCols - 1 : v,
            direction: tailDirection,
          };
          copy.push(elementPosition);
          break;
        }
      }

      generateGoal(initialFieldRows, initialFieldCols, copy);
    }

    return copy;
  };

  const updateSnakeCellDirection = (
    snake: ISnakeCellPosition[]
  ): ISnakeCellPosition[] => {
    const copy: ISnakeCellPosition[] = JSON.parse(JSON.stringify(snake));

    for (let i = copy.length - 1; i > 0; i--) {
      copy[i].direction = copy[i - 1].direction;
    }

    return copy;
  };

  const stopGame = () => {
    isGameStarted = false;
    clearInterval(snakeTimerId);
  };

  const resetGame = () => {
    stopGame();
    clearLeftCell();
    snake = initiateSnake(
      snakeDefaultLength,
      initialDirection,
      initialFieldRows,
      initialFieldCols
    );
  };

  const controllers = {
    startGame: {
      action: startGame,
      label: "START",
      id: "start",
    },
    stopGame: {
      action: stopGame,
      label: "STOP",
      id: "stop",
    },
    resetGame: {
      action: resetGame,
      label: "RESET",
      id: "reset",
    },
  };

  const generateControllers = () => {
    const activeControllers = Object.values(controllers);

    const controllersContainer: HTMLDivElement = document.createElement("div");
    controllersContainer.classList.add("controllersContainer");

    activeControllers.forEach(({ action, label, id }) => {
      const btn: HTMLButtonElement = document.createElement("button");
      btn.id = id;
      const btnText: Text = document.createTextNode(label);
      btn.appendChild(btnText);

      btn.addEventListener("click", action);

      controllersContainer.appendChild(btn);
    });

    snakeContainer?.appendChild(controllersContainer);
  };

  const generateScore = (score: number) => {
    const scoreContainer: HTMLDivElement | null =
      document.querySelector(".scoreContainer");

    if (scoreContainer) {
      scoreContainer.innerHTML = `Score: ${score}`;
      snakeContainer?.appendChild(scoreContainer);
    } else {
      const scoreContainer: HTMLDivElement = document.createElement("div");
      scoreContainer.classList.add("scoreContainer");
      const scoreText: Text = document.createTextNode(`Score: ${score}`);
      scoreContainer.appendChild(scoreText);
      snakeContainer?.appendChild(scoreContainer);
    }
  };

  const rotateSnake = (e: KeyboardEvent) => {
    const snakeHead: ISnakeCellPosition = snake[0];

    if (
      e.code == "ArrowUp" &&
      snakeHead.direction !== snakeDirection.UP &&
      snakeHead.direction !== snakeDirection.DOWN
    ) {
      snake[0].direction = snakeDirection.UP;
    } else if (
      e.code == "ArrowDown" &&
      snakeHead.direction !== snakeDirection.UP &&
      snakeHead.direction !== snakeDirection.DOWN
    ) {
      snake[0].direction = snakeDirection.DOWN;
    } else if (
      e.code == "ArrowLeft" &&
      snakeHead.direction !== snakeDirection.LEFT &&
      snakeHead.direction !== snakeDirection.RIGHT
    ) {
      snake[0].direction = snakeDirection.LEFT;
    } else if (
      e.code == "ArrowRight" &&
      snakeHead.direction !== snakeDirection.LEFT &&
      snakeHead.direction !== snakeDirection.RIGHT
    ) {
      snake[0].direction = snakeDirection.RIGHT;
    }
  };

  generateField(initialFieldRows, initialFieldCols);

  snakeContainer?.addEventListener("keydown", rotateSnake);

  let snake: ISnakeCellPosition[] = initiateSnake(
    snakeDefaultLength,
    initialDirection,
    initialFieldRows,
    initialFieldCols
  );

  generateControllers();
  generateScore(score);
});

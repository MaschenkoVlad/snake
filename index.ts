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
      score: number;
    };
  }

  interface IGameControllers {
    [key: string]: {
      action: (args: MouseEvent | boolean | undefined) => void;
      label: string;
      id: string;
    };
  }

  let score: number = 0;
  let baseSpeed: number = 1500;
  let speed: number = 100;
  const snakeDefaultLength: number = 4;

  const gameLvl: IGameLvl = {
    easy: {
      speed: 100,
      score: 0,
    },
    medium: {
      speed: 300,
      score: 50,
    },
    hard: {
      speed: 500,
      score: 100,
    },
    impossible: {
      speed: 1000,
      score: 200,
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
  let snake: ISnakeCellPosition[] = [];

  const snakeContainer: HTMLDivElement | null =
    document.querySelector("#snake");

  const debounce = (func: any, timeout = 200) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: any) => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  };

  const findRight = <T>(
    arr: T[],
    callback: (arg: T, index: number, arr: T[]) => boolean
  ): T | undefined => {
    const length = arr.length;

    for (let i = length - 1; i >= 0; i--) {
      const element = arr[i];
      if (callback(element, i, arr)) {
        return element;
      }
    }

    return undefined;
  };

  const renderSnake = (snake: ISnakeCellPosition[]): void => {
    snake.forEach(({ x, y }) => {
      const element: HTMLElement | null = document.querySelector(
        `.cell[data-x="${x}"][data-y="${y}"]`
      );

      if (element) {
        element.style.backgroundColor = snakeColor;
      }
    });
  };

  const clearCells = (): void => {
    const cells: HTMLElement[] = Array.from(
      document.querySelectorAll(".cell:not([data-goal])")
    );

    cells.forEach(
      (element) => (element.style.backgroundColor = clearCellColor)
    );
  };

  const generateField = (rows: number, cols: number): void => {
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
  ): void => {
    let xGoal: number;
    let yGoal: number;
    let isSnakeCoords: ISnakeCellPosition | undefined;

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

      isSnakeCoords = snake.find(({ x, y }) => x === xGoal && y === yGoal);
    } while (isSnakeCoords);

    const element: HTMLElement | null = document.querySelector(
      `.cell[data-x="${xGoal}"][data-y="${yGoal}"]`
    );

    if (element) {
      element.style.backgroundColor = goalColor;
      element.dataset.goal = "goal";
    }
  };

  // TODO:
  const startGame = (args: MouseEvent | boolean | undefined): void => {
    if (typeof args !== "boolean") {
      generateGoal(initialFieldRows, initialFieldCols, snake);
    }

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

      // 1) Check if have got the goal
      // 2) Check if have have touched itself
      snake = snakeIntersection(getGoal(newPositions));
      // 3) Clear field for new render
      clearCells();
      // 4) Render new snake positions
      renderSnake(snake);
      // 5) Update snake direction if we changed it
      snake = updateSnakeCellDirection(snake);
      // 6) Update snake speed if we increased score
      updateSnakeSpeed(score, gameLvl);
    }, baseSpeed - speed);
  };

  const snakeIntersection = (
    snake: ISnakeCellPosition[]
  ): ISnakeCellPosition[] => {
    const head: ISnakeCellPosition = snake[0];

    const intersection: number = snake
      .slice(1)
      .findIndex(({ x, y }) => x === head.x && y === head.y);

    if (intersection > 0) {
      const newSnake: ISnakeCellPosition[] = snake.slice(0, intersection + 1); // TODO:
      const newSnakeScore: number = newSnake.length - snakeDefaultLength;
      score = newSnakeScore;

      renderScore(score);
      updateSnakeSpeed(score, gameLvl);

      return newSnake;
    }

    return snake;
  };

  const updateSnakeSpeed = (score: number, gameLvl: IGameLvl): void => {
    const newLvl = findRight(
      Object.values(gameLvl),
      ({ score: lvlScore }) => score >= lvlScore
    );

    const newSpeed: number | undefined = newLvl?.speed;

    if (newSpeed && newSpeed !== speed) {
      speed = newSpeed;

      stopGame();
      startGame(true);
    }
  };

  const getGoal = (snake: ISnakeCellPosition[]): ISnakeCellPosition[] => {
    const copySnake: ISnakeCellPosition[] = JSON.parse(JSON.stringify(snake));
    const snakeHead: ISnakeCellPosition = copySnake[0];

    const goalElement: HTMLElement | null = document.querySelector(
      `.cell[data-x="${snakeHead.x}"][data-y="${snakeHead.y}"][data-goal]`
    );

    if (goalElement) {
      score += 10;
      renderScore(score);

      const {
        x,
        y,
        direction: tailDirection,
      } = copySnake.at(-1) as ISnakeCellPosition;

      switch (tailDirection) {
        case snakeDirection.UP: {
          const v = x + 1;
          const elementPosition: ISnakeCellPosition = {
            x: v < 0 ? initialFieldRows - 1 : v,
            y: y,
            direction: tailDirection,
          };
          copySnake.push(elementPosition);
          break;
        }
        case snakeDirection.DOWN: {
          const v = x - 1;
          const elementPosition: ISnakeCellPosition = {
            x: v > initialFieldRows - 1 ? 0 : v,
            y: y,
            direction: tailDirection,
          };
          copySnake.push(elementPosition);
          break;
        }
        case snakeDirection.RIGHT: {
          const v = y - 1;
          const elementPosition: ISnakeCellPosition = {
            x: x,
            y: v > initialFieldCols - 1 ? 0 : v,
            direction: tailDirection,
          };
          copySnake.push(elementPosition);
          break;
        }
        case snakeDirection.LEFT: {
          const v = y + 1;
          const elementPosition: ISnakeCellPosition = {
            x: x,
            y: v < 0 ? initialFieldCols - 1 : v,
            direction: tailDirection,
          };
          copySnake.push(elementPosition);
          break;
        }
      }

      generateGoal(initialFieldRows, initialFieldCols, copySnake);
    }

    return copySnake;
  };

  // Обновляем направление ячейки с конца
  // ячейка берет направление с ячейки впереди идущей
  const updateSnakeCellDirection = (
    snake: ISnakeCellPosition[]
  ): ISnakeCellPosition[] => {
    const copySnake: ISnakeCellPosition[] = JSON.parse(JSON.stringify(snake));

    for (let i = copySnake.length - 1; i > 0; i--) {
      copySnake[i].direction = copySnake[i - 1].direction;
    }

    return copySnake;
  };

  const stopGame = (): void => {
    isGameStarted = false;
    clearInterval(snakeTimerId);
  };

  const resetGame = () => {
    stopGame();

    clearCells();

    score = 0;

    snake = initiateSnake(
      snakeDefaultLength,
      initialDirection,
      initialFieldRows,
      initialFieldCols
    );
  };

  const controllers: IGameControllers = {
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

  const renderControllers = (controllers: IGameControllers): void => {
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

    const scoreElement: HTMLDivElement | null =
      document.querySelector(".scoreContainer");

    if (scoreElement && snakeContainer) {
      if (scoreElement?.nextSibling) {
        snakeContainer.insertBefore(
          controllersContainer,
          scoreElement?.nextSibling
        );
      } else {
        snakeContainer.appendChild(controllersContainer);
      }
    }
  };

  const renderScore = (score: number): void => {
    let scoreContainer: HTMLDivElement | null =
      document.querySelector(".scoreContainer");

    if (scoreContainer) {
      scoreContainer.innerHTML = `Score: ${score}`;
    } else {
      scoreContainer = document.createElement("div");
      scoreContainer.classList.add("scoreContainer");
      const scoreText: Text = document.createTextNode(`Score: ${score}`);
      scoreContainer.appendChild(scoreText);
    }

    snakeContainer?.insertBefore(scoreContainer, snakeContainer.firstChild);
  };

  // Is there any way to improvements?
  const rotateSnake = (e: KeyboardEvent): void => {
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

  snakeContainer?.addEventListener("keydown", debounce(rotateSnake));

  renderScore(score);
  renderControllers(controllers);
  snake = initiateSnake(
    snakeDefaultLength,
    initialDirection,
    initialFieldRows,
    initialFieldCols
  );
});

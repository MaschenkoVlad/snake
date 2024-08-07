document.addEventListener("DOMContentLoaded", function (e) {
    var _this = this;
    var snakeDirection;
    (function (snakeDirection) {
        snakeDirection["UP"] = "UP";
        snakeDirection["DOWN"] = "DOWN";
        snakeDirection["LEFT"] = "LEFT";
        snakeDirection["RIGHT"] = "RIGHT";
    })(snakeDirection || (snakeDirection = {}));
    var score = 0;
    var baseSpeed = 1500;
    var speed = 100;
    var snakeDefaultLength = 4;
    var gameLvl = {
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
    var initialFieldRows = 16;
    var initialFieldCols = 16;
    var snakeColor = "#32CD32";
    var clearCellColor = "#ffffff";
    var goalColor = "#20B2AA";
    var snakeTimerId;
    var isGameStarted = false;
    var initialDirection = snakeDirection.UP;
    var snake = [];
    var snakeContainer = document.querySelector("#snake");
    var debounce = function (func, timeout) {
        if (timeout === void 0) { timeout = 200; }
        var timer;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            clearTimeout(timer);
            timer = setTimeout(function () {
                func.apply(_this, args);
            }, timeout);
        };
    };
    var findRight = function (arr, callback) {
        var length = arr.length;
        for (var i = length - 1; i >= 0; i--) {
            var element = arr[i];
            if (callback(element, i, arr)) {
                return element;
            }
        }
        return undefined;
    };
    var renderSnake = function (snake) {
        snake.forEach(function (_a) {
            var x = _a.x, y = _a.y;
            var element = document.querySelector(".cell[data-x=\"".concat(x, "\"][data-y=\"").concat(y, "\"]"));
            if (element) {
                element.style.backgroundColor = snakeColor;
            }
        });
    };
    var clearCells = function () {
        var cells = Array.from(document.querySelectorAll(".cell:not([data-goal])"));
        cells.forEach(function (element) { return (element.style.backgroundColor = clearCellColor); });
    };
    var generateField = function (rows, cols) {
        var fieldContainer = document.createElement("div");
        fieldContainer.classList.add("fieldContainer");
        fieldContainer.style.width = rows * 22 + "px"; // 22 is 20px cell width + 2px left and right border
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                var cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.x = i + "";
                cell.dataset.y = j + "";
                fieldContainer.appendChild(cell);
            }
        }
        snakeContainer === null || snakeContainer === void 0 ? void 0 : snakeContainer.appendChild(fieldContainer);
    };
    var initiateSnake = function (len, direction, initialFieldRows, initialFieldCols) {
        var headPosition = {
            x: Math.floor(initialFieldRows / 2),
            y: Math.floor(initialFieldCols / 2),
            direction: direction,
        };
        var snake = [headPosition];
        var lenAsArr = Array.from({ length: len - 1 });
        switch (direction) {
            case snakeDirection.UP: {
                lenAsArr.forEach(function (_, i) {
                    var elementPosition = {
                        x: headPosition.x + i + 1,
                        y: headPosition.y,
                        direction: direction,
                    };
                    snake.push(elementPosition);
                });
                break;
            }
            case snakeDirection.DOWN: {
                lenAsArr.forEach(function (_, i) {
                    var elementPosition = {
                        x: headPosition.x - i - 1,
                        y: headPosition.y,
                        direction: direction,
                    };
                    snake.push(elementPosition);
                });
                break;
            }
            case snakeDirection.LEFT: {
                lenAsArr.forEach(function (_, i) {
                    var elementPosition = {
                        x: headPosition.x,
                        y: headPosition.y + i + 1,
                        direction: direction,
                    };
                    snake.push(elementPosition);
                });
                break;
            }
            case snakeDirection.RIGHT: {
                lenAsArr.forEach(function (_, i) {
                    var elementPosition = {
                        x: headPosition.x,
                        y: headPosition.y - i - 1,
                        direction: direction,
                    };
                    snake.push(elementPosition);
                });
                break;
            }
        }
        renderSnake(snake);
        return snake;
    };
    var generateGoal = function (initialFieldRows, initialFieldCols, snake) {
        var xGoal;
        var yGoal;
        var isSnakeCoords;
        var existGoal = document.querySelector(".cell[data-goal=goal]");
        if (existGoal) {
            existGoal.style.backgroundColor = clearCellColor;
            existGoal.removeAttribute("data-goal");
        }
        do {
            xGoal = Math.floor(Math.random() * initialFieldRows);
            yGoal = Math.floor(Math.random() * initialFieldCols);
            isSnakeCoords = snake.find(function (_a) {
                var x = _a.x, y = _a.y;
                return x === xGoal && y === yGoal;
            });
        } while (isSnakeCoords);
        var element = document.querySelector(".cell[data-x=\"".concat(xGoal, "\"][data-y=\"").concat(yGoal, "\"]"));
        if (element) {
            element.style.backgroundColor = goalColor;
            element.dataset.goal = "goal";
        }
    };
    // TODO:
    var startGame = function (args) {
        if (typeof args !== "boolean") {
            generateGoal(initialFieldRows, initialFieldCols, snake);
        }
        if (isGameStarted)
            return;
        isGameStarted = true;
        snakeTimerId = setInterval(function () {
            var newPositions = snake.map(function (_a) {
                var x = _a.x, y = _a.y, direction = _a.direction;
                switch (direction) {
                    case snakeDirection.UP: {
                        var v = x - 1;
                        var elementPosition = {
                            x: v < 0 ? initialFieldRows - 1 : v,
                            y: y,
                            direction: direction,
                        };
                        return elementPosition;
                    }
                    case snakeDirection.DOWN: {
                        var v = x + 1;
                        var elementPosition = {
                            x: v > initialFieldRows - 1 ? 0 : v,
                            y: y,
                            direction: direction,
                        };
                        return elementPosition;
                    }
                    case snakeDirection.RIGHT: {
                        var v = y + 1;
                        var elementPosition = {
                            x: x,
                            y: v > initialFieldCols - 1 ? 0 : v,
                            direction: direction,
                        };
                        return elementPosition;
                    }
                    case snakeDirection.LEFT: {
                        var v = y - 1;
                        var elementPosition = {
                            x: x,
                            y: v < 0 ? initialFieldCols - 1 : v,
                            direction: direction,
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
    var snakeIntersection = function (snake) {
        var head = snake[0];
        var intersection = snake
            .slice(1)
            .findIndex(function (_a) {
            var x = _a.x, y = _a.y;
            return x === head.x && y === head.y;
        });
        if (intersection > 0) {
            var newSnake = snake.slice(0, intersection + 1); // TODO:
            var newSnakeScore = newSnake.length - snakeDefaultLength;
            score = newSnakeScore;
            renderScore(score);
            updateSnakeSpeed(score, gameLvl);
            return newSnake;
        }
        return snake;
    };
    var updateSnakeSpeed = function (score, gameLvl) {
        var newLvl = findRight(Object.values(gameLvl), function (_a) {
            var lvlScore = _a.score;
            return score >= lvlScore;
        });
        var newSpeed = newLvl === null || newLvl === void 0 ? void 0 : newLvl.speed;
        if (newSpeed && newSpeed !== speed) {
            speed = newSpeed;
            stopGame();
            startGame(true);
        }
    };
    var getGoal = function (snake) {
        var copySnake = JSON.parse(JSON.stringify(snake));
        var snakeHead = copySnake[0];
        var goalElement = document.querySelector(".cell[data-x=\"".concat(snakeHead.x, "\"][data-y=\"").concat(snakeHead.y, "\"][data-goal]"));
        if (goalElement) {
            score += 10;
            renderScore(score);
            var _a = copySnake.at(-1), x = _a.x, y = _a.y, tailDirection = _a.direction;
            switch (tailDirection) {
                case snakeDirection.UP: {
                    var v = x + 1;
                    var elementPosition = {
                        x: v < 0 ? initialFieldRows - 1 : v,
                        y: y,
                        direction: tailDirection,
                    };
                    copySnake.push(elementPosition);
                    break;
                }
                case snakeDirection.DOWN: {
                    var v = x - 1;
                    var elementPosition = {
                        x: v > initialFieldRows - 1 ? 0 : v,
                        y: y,
                        direction: tailDirection,
                    };
                    copySnake.push(elementPosition);
                    break;
                }
                case snakeDirection.RIGHT: {
                    var v = y - 1;
                    var elementPosition = {
                        x: x,
                        y: v > initialFieldCols - 1 ? 0 : v,
                        direction: tailDirection,
                    };
                    copySnake.push(elementPosition);
                    break;
                }
                case snakeDirection.LEFT: {
                    var v = y + 1;
                    var elementPosition = {
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
    var updateSnakeCellDirection = function (snake) {
        var copySnake = JSON.parse(JSON.stringify(snake));
        for (var i = copySnake.length - 1; i > 0; i--) {
            copySnake[i].direction = copySnake[i - 1].direction;
        }
        return copySnake;
    };
    var stopGame = function () {
        isGameStarted = false;
        clearInterval(snakeTimerId);
    };
    var resetGame = function () {
        stopGame();
        clearCells();
        score = 0;
        snake = initiateSnake(snakeDefaultLength, initialDirection, initialFieldRows, initialFieldCols);
    };
    var controllers = {
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
    var renderControllers = function (controllers) {
        var activeControllers = Object.values(controllers);
        var controllersContainer = document.createElement("div");
        controllersContainer.classList.add("controllersContainer");
        activeControllers.forEach(function (_a) {
            var action = _a.action, label = _a.label, id = _a.id;
            var btn = document.createElement("button");
            btn.id = id;
            var btnText = document.createTextNode(label);
            btn.appendChild(btnText);
            btn.addEventListener("click", action);
            controllersContainer.appendChild(btn);
        });
        var scoreElement = document.querySelector(".scoreContainer");
        if (scoreElement && snakeContainer) {
            if (scoreElement === null || scoreElement === void 0 ? void 0 : scoreElement.nextSibling) {
                snakeContainer.insertBefore(controllersContainer, scoreElement === null || scoreElement === void 0 ? void 0 : scoreElement.nextSibling);
            }
            else {
                snakeContainer.appendChild(controllersContainer);
            }
        }
    };
    var renderScore = function (score) {
        var scoreContainer = document.querySelector(".scoreContainer");
        if (scoreContainer) {
            scoreContainer.innerHTML = "Score: ".concat(score);
        }
        else {
            scoreContainer = document.createElement("div");
            scoreContainer.classList.add("scoreContainer");
            var scoreText = document.createTextNode("Score: ".concat(score));
            scoreContainer.appendChild(scoreText);
        }
        snakeContainer === null || snakeContainer === void 0 ? void 0 : snakeContainer.insertBefore(scoreContainer, snakeContainer.firstChild);
    };
    // Is there any way to improvements?
    var rotateSnake = function (e) {
        var snakeHead = snake[0];
        if (e.code == "ArrowUp" &&
            snakeHead.direction !== snakeDirection.UP &&
            snakeHead.direction !== snakeDirection.DOWN) {
            snake[0].direction = snakeDirection.UP;
        }
        else if (e.code == "ArrowDown" &&
            snakeHead.direction !== snakeDirection.UP &&
            snakeHead.direction !== snakeDirection.DOWN) {
            snake[0].direction = snakeDirection.DOWN;
        }
        else if (e.code == "ArrowLeft" &&
            snakeHead.direction !== snakeDirection.LEFT &&
            snakeHead.direction !== snakeDirection.RIGHT) {
            snake[0].direction = snakeDirection.LEFT;
        }
        else if (e.code == "ArrowRight" &&
            snakeHead.direction !== snakeDirection.LEFT &&
            snakeHead.direction !== snakeDirection.RIGHT) {
            snake[0].direction = snakeDirection.RIGHT;
        }
    };
    generateField(initialFieldRows, initialFieldCols);
    snakeContainer === null || snakeContainer === void 0 ? void 0 : snakeContainer.addEventListener("keydown", debounce(rotateSnake));
    renderScore(score);
    renderControllers(controllers);
    snake = initiateSnake(snakeDefaultLength, initialDirection, initialFieldRows, initialFieldCols);
});

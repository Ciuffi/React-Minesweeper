import React, { useState } from "react";
import "./App.css";

const WhoAreMyNeighbours = (grid, x, y) => {
  const neighbours = [];
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (x === i && y === j) {
        continue;
      }
      if (i >= grid.length || i < 0) {
        continue;
      }
      if (j >= grid[i].length || j < 0) {
        continue;
      }
      neighbours.push({ x: i, y: j, val: grid[i][j].val });
    }
  }
  return neighbours;
};

const CountBombs = (grid, x, y) => {
  const n = WhoAreMyNeighbours(grid, x, y);
  const ret = n.reduce((prev, curr) => {
    return prev + curr.val;
  }, 0);
  return ret;
};

const GridPiece = ({
  number,
  clicked,
  index1,
  index2,
  shown,
  isbomb,
  flagged,
  flag,
  touched,
  touchCancelled
}) => {
  return (
    <div
      onClick={() => clicked(index1, index2)}
      onTouchStart={() => touched}
      onTouchCancel={() => touchCancelled}
      onContextMenu={e => {
        e.preventDefault();
        flag(index1, index2);
      }}
      className="gridPiece"
      style={{
        backgroundColor: shown && isbomb ? "red" : flagged ? "yellow" : null
      }}
    >
      {shown && !isbomb
        ? number
        : flagged
        ? "🚩"
        : isbomb && shown
        ? "💣"
        : null}
    </div>
  );
};

const UseGrid = () => {
  const safeSpots = [];
  const bombs = [];
  const createGrid = () => {
    const gridStarter = new Array(10).fill(0).map((b, x) =>
      new Array(15).fill(0).map((a, y) => {
        const type = Math.floor(Math.random() * 7);
        if (type > 0) safeSpots.push({ x, y });
        if (type === 0) bombs.push({ x, y });
        return {
          flagged: false,
          shown: false,
          val: type === 0 ? 1 : 0
        };
      })
    );

    const { x: safeX, y: safeY } = safeSpots[
      Math.floor(Math.random() * safeSpots.length)
    ];

    gridStarter[safeX][safeY].shown = true;
    return gridStarter.map((grid, i) =>
      grid.map((piece, j) => {
        return { ...piece, bombCount: CountBombs(gridStarter, i, j) };
      })
    );
  };

  const [grid, setGrid] = useState(createGrid());

  const clearSpecificNeighbours = (grid, neighbours) => {
    if (!neighbours.length) return;
    const { x, y } = neighbours[0];
    grid[x][y].shown = true;
    setGrid([...grid]);
    setTimeout(
      () => clearSpecificNeighbours(grid, [...neighbours.slice(1)]),
      0.01
    );
  };

  const clearNeighbours = (grid, x, y, visited) => {
    const neighbours = WhoAreMyNeighbours(grid, x, y);
    if (grid[x][y].bombCount !== 0) return;
    const showers = [];
    neighbours.forEach(({ x, y, val }) => {
      if (grid[x][y].bombCount === 0 && val === 0) {
        showers.push({ x, y });
      }
    });
    clearSpecificNeighbours(grid, showers);
    if (visited.find(res => res.x === x && res.y === y)) return;
    visited.push({ x, y });
    setTimeout(() => {
      showers.forEach(({ x, y }) => {
        clearNeighbours(grid, x, y, visited);
      });
    }, 0.01);
  };

  const setGridPos = (x, y) => {
    if (grid[x][y].flagged) return;
    if (grid[x][y].shown) return;
    grid[x][y].shown = true;
    clearNeighbours(grid, x, y, []);
    setGrid([...grid]);
  };

  const flagGridPiece = (x, y) => {
    grid[x][y].flagged = !grid[x][y].flagged;
    setGrid([...grid]);
  };

  const showGrid = () => {
    grid.map(grid => grid.map(piece => (piece.shown = true)));
  };

  const resetGrid = () => setGrid(createGrid());

  const checkWin = () => {
    safeSpots.filter(safeSpot => {
      return !grid[safeSpot.x][safeSpot.y].shown;
    });
    return safeSpots.length === 0;
  };
  return [grid, setGridPos, resetGrid, flagGridPiece, showGrid, checkWin];
};

const EndScreen = ({ gameState, resetGame }) => {
  return (
    <div
      style={{
        textAlign: "center",
        position: "absolute",
        color: gameState === "win" ? "green" : "pink",
        fontSize: "2em",
        top: "10%",
        left: "25%",
        height: "20%"
      }}
    >
      <h1>{gameState === "win" ? "You won!" : "You lose."}</h1>
      <button onClick={() => resetGame()}>Play Again?</button>
    </div>
  );
};

function App() {
  const [
    grid,
    setGridPos,
    resetGrid,
    flagGridPiece,
    showGrid,
    checkWin
  ] = UseGrid();
  const [gameState, setGameState] = useState("");
  const clicked = (x, y) => {
    if (gameState !== "") return;
    setGridPos(x, y);
    if (grid[x][y].val === 1) {
      setGameState("lose");
      showGrid();
      return;
    }
    if (checkWin(grid)) {
      setGameState("win");
      return;
    }
  };

  const resetGame = () => {
    setGameState("");
    resetGrid();
  };

  let buttonPressTimer = null;
  const handleLongCancel = () => {
    clearTimeout(buttonPressTimer);
  };

  const handleLongPress = (x, y) => {
    buttonPressTimer = setTimeout(() => flagGridPiece(x, y), 1000);
  };
  return (
    <div id="container">
      <div className="App">
        <h1 id="title">Minesweeper made in React!</h1>
        <p>Left click to reveal and right click to flag.</p>
        {gameState !== "" ? (
          <EndScreen gameState={gameState} resetGame={resetGame} />
        ) : null}
        <div className="grid">
          {grid.map((col, index1) => (
            <div key={index1} style={{ display: "flex" }}>
              {col.map((row, index2) => (
                <GridPiece
                  key={index2}
                  shown={row.shown}
                  number={row.bombCount}
                  isbomb={row.val === 1 ? true : false}
                  index1={index1}
                  index2={index2}
                  clicked={clicked}
                  flagged={row.flagged}
                  flag={flagGridPiece}
                  touched={handleLongPress}
                  touchCancelled={handleLongCancel}
                />
              ))}
            </div>
          ))}
        </div>
        <p>
          Developed by Giulio Rossi. Check out more at{" "}
          <a
            href="https://ciuffi.dev"
            rel="noopener noreferrer"
            target="_blank"
            style={{ color: "lightblue" }}
          >
            Ciuffi.dev
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;

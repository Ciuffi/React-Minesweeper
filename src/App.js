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

const checkWin = grid => {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const piece = grid[i][j];
      if (piece.shown === false && piece.val === 0) {
        return false;
      }
    }
  }
  return true;
};

const GridPiece = ({
  number,
  clicked,
  index1,
  index2,
  shown,
  isbomb,
  flagged,
  flag
}) => {
  return (
    <div
      onClick={() => clicked(index1, index2)}
      onContextMenu={e => {
        e.preventDefault();
        flag(index1, index2);
      }}
      className="gridPiece"
      style={{
        backgroundColor: shown && isbomb ? "red" : flagged ? "yellow" : "grey"
      }}
    >
      {shown && !isbomb ? number : null}
    </div>
  );
};

const UseGrid = () => {
  const safeSpots = [];
  const createGrid = () => {
    const gridStarter = new Array(10).fill(0).map((b, x) =>
      new Array(15).fill(0).map((a, y) => {
        const type = Math.floor(Math.random() * 2);
        if (type === 0) safeSpots.push({ x, y });
        return {
          flagged: false,
          shown: false,
          val: type
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

  const setGridPos = (x, y) => {
    grid[x][y].shown = true;
    setGrid([...grid]);
  };

  const flagGridPiece = (x, y) => {
    grid[x][y].flagged = !grid[x][y].flagged;
    setGrid([...grid]);
  };

  const resetGrid = () => setGrid(createGrid());
  return [grid, setGridPos, resetGrid, flagGridPiece];
};

const EndScreen = ({ state, resetGame }) => {
  return (
    <div
      style={{
        textAlign: "center",
        position: "absolute",
        color: state === "win" ? "green" : "pink",
        fontSize: "2em",
        top: "10%",
        left: "25%",
        height: "20%"
      }}
    >
      <h1>{state === "win" ? "You won!" : "You lose."}</h1>
      <button onClick={() => resetGame()}>Play Again?</button>
    </div>
  );
};

function App() {
  const [grid, setGridPos, resetGrid, flagGridPiece] = UseGrid();
  const [gameState, setGameState] = useState("");
  const clicked = (x, y) => {
    if (gameState !== "") return;
    setGridPos(x, y);
    if (grid[x][y].val === 1) {
      setGameState("lose");
      return;
    }
    if (checkWin(grid)) {
      setGameState("win");
    }
  };

  const resetGame = () => {
    setGameState("");
    resetGrid();
  };
  return (
    <div id="container">
      <div className="App">
        <h1 id="title">Minesweeper made in React!</h1>
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
          >
            Ciuffi.dev
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;

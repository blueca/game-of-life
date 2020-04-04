import React from 'react';

const Controls = (props) => {
  return (
    <div className="controls">
      {props.isRunning ? (
        <button className="button" onClick={props.stopGame}>
          Stop
        </button>
      ) : (
        <button className="button" onClick={props.runGame}>
          Start
        </button>
      )}
      <button className="button" onClick={props.clearBoard}>
        Clear
      </button>
      <input
        type="range"
        name="randomDensity"
        id="randomDensity"
        min="10"
        max="50"
        defaultValue="30"
        onMouseUp={props.changeDensity}
      />
      <button className="button" onClick={props.randomBoard}>
        Random Pattern
      </button>
      <select
        name="premadePatterns"
        id="premadePatterns"
        defaultValue="default"
        onChange={props.selectPattern}
      >
        <option value="default" disabled>
          Select Pre-made Pattern
        </option>
        <option value="glider">Glider</option>
        <option value="gliderGun">Gosper Glider Gun</option>
        <option value="line">Line</option>
        <option value="stairs">Stairs</option>
        <option value="square">Square</option>
        <option value="pulsar">Pulsar</option>
      </select>
    </div>
  );
};

export default Controls;

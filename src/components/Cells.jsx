import React from 'react';

class Cells extends React.Component {
  render() {
    const { x, y } = this.props;
    return (
      <div
        className="Cell"
        style={{
          left: `${this.props.cellSize * x + 1}px`,
          top: `${this.props.cellSize * y + 1}px`,
          width: `${this.props.cellSize - 1}px`,
          height: `${this.props.cellSize - 1}px`,
        }}
      />
    );
  }
}

export default Cells;

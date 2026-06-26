import React, { useState } from 'react';

const Stars = ({ rating = 0, interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className="star-container" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= Math.round(displayRating);
        return (
          <span
            key={starValue}
            className={`star-icon ${isFilled ? 'star-filled' : 'star-empty'}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default Stars;

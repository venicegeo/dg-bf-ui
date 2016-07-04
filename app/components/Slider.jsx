import React from 'react'
import debounce from 'lodash/debounce'
import ReactSlider from 'react-slider'
import styles from './Slider.css'

export default function Slider({
  className,
  min = 0,
  max = 100,
  value = 50,
  onChange
}) {
  return (
    <div className={`${styles.root} ${className || ''}`}>
      <span className={styles.number}>{min}</span>
      <ReactSlider
        withBars
        max={max}
        min={min}
        value={value}
        barClassName={styles.bar}
        className={styles.slider}
        onChange={debounce(onChange, 100)}
      >
        <div className={styles.puck}>
          <span className={styles.value}>{value}</span>
        </div>
      </ReactSlider>
      <span className={styles.number}>{max}</span>
    </div>
  )
}

Slider.propTypes = {
  className: React.PropTypes.string,
  max:       React.PropTypes.number,
  min:       React.PropTypes.number,
  onChange:  React.PropTypes.func.isRequired,
  value:     React.PropTypes.number,
}

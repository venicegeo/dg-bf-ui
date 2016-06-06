import React, {Component} from 'react'
import styles from './BasemapSelect.css'

export default class BasemapSelect extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    basemaps: React.PropTypes.array,
    changed: React.PropTypes.func
  }

  constructor() {
    super()
    this.state = {index: 0, isOpen: false}
    this._toggleOpen = this._toggleOpen.bind(this)
  }

  render() {
    const {index, isOpen} = this.state
    const {basemaps, className} = this.props
    const current = basemaps[index]
    return (
      <div className={`${styles.root} ${className} ${isOpen ? styles.isOpen : ''}`}>
        <div className={styles.button} onClick={this._toggleOpen}>
          <label>
            <svg viewBox="0 0 40 33">
              <polygon points="36.4644661 17.3228873 40 19.5276993 20 32 0 19.5276993 3.53553391 17.3228873 20 27.5903758 36.4644661 17.3228873"/>
              <polygon points="40 12.4723007 20 24.9446013 0 12.4723007 20 0"/>
            </svg>
            {current}
          </label>
          <span><i className="fa fa-caret-down"/></span>
        </div>
        <ul className={styles.options}>
          {basemaps.map((basemap, i) => (
            <li key={i}
                className={index === i ? styles.active : ''}
                onClick={() => this._select(i)}>{basemap}</li>
          ))}
        </ul>
      </div>
    )
  }

  _select(index) {
    this.props.changed(index)
    this.setState({index, isOpen: false})
  }

  _toggleOpen() {
    this.setState({isOpen: !this.state.isOpen})
  }
}

import React, {Component} from 'react'
import styles from '../styles/shared/fields.less'

export const TYPE_IMAGE = 'image'

export default class InputTypeImage extends Component {
  static propTypes = {
    images: React.PropTypes.array,
    name: React.PropTypes.string
  }

  render() {
    return (
      <label className={styles.normal}>
        <span>{this.props.name}</span>
        <select ref="input">
          {this.props.images.map(image => <option key={image.name} value={image.ids.join(',')}>{image.name}</option>)}
        </select>
      </label>
    )
  }

  get value() {
    return this.refs.input.value
  }
}

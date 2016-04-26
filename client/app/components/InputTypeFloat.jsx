import React, {Component} from 'react';
import styles from '../styles/shared/fields.less';

export const TYPE_FLOAT = 'float';

export default class InputTypeFloat extends Component {
  static propTypes = {
    name: React.PropTypes.string
  };
  
  render() {
    return (
      <label className={styles.normal}>
        <span>{this.props.name}</span>
        <input ref="input" type="number" step="0.5"/>
      </label>
    );
  }
  
  get value() {
    return this.refs.input.value;
  }
}

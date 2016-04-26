import React, {Component} from 'react';

export default class Modal extends Component {
  static propTypes = {
    children: React.PropTypes.oneOfType([React.PropTypes.element, React.PropTypes.arrayOf(React.PropTypes.element)]),
    className: React.PropTypes.string,
    dismiss: React.PropTypes.func
  };

  componentDidMount() {
    document.addEventListener('click', this.props.dismiss);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.props.dismiss);
  }

  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
}

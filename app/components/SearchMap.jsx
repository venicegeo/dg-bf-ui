import React, {Component} from 'react'
import Modal from './Modal'
import styles from './SearchMap.css'
import {_searchClicked} from '../utils/openlayers.SearchControl'

export default class SearchMap extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    dismiss: React.PropTypes.func,
    router: React.PropTypes.object,
    location: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {modalIsOpen: null}
    this._handleSubmit = this._handleSubmit.bind(this)
    console.log('made it to searchmap')
  }

  openModal() {
    this.setState({modalIsOpen: true})
  }

  closeModal() {
    this.setState({modalIsOpen: false})
  }

  handleModalCloseRequest() {
    // opportunity to validate something and keep the modal open even if it
    // requested to be closed
    this.setState({modalIsOpen: false})
  }


  render() {
    return (
      <Modal className={styles.root} dismiss={this.props.dismiss} isOpen={this.state.modalIsOpen}
             onAfterOpen={this.handleOnAfterOpenModal}
             onRequestClose={this.handleModalCloseRequest}>
        <form onSubmit={this._handleSubmit}>
          <table>
            <tr width="100%">
              <td width="300px">
                <input ref="coordinates" style={{width: '300px', height: '15px'}} placeholder="Coordinates" /></td>
              <td align="right" width="100px">
                <button type="submit"><i className="fa fa-search fa-1x"></i></button>
              </td>
            </tr>
          </table>
        </form>
      </Modal>
    )
  }

  _handleSubmit(event) {
    var long = '38.9072'
    var lat = '77.0369'
    this.setState({modalIsOpen: false})

    //TODO: Parse long/lat out of input box, call centermap and pass values in.
    //searchClicked(long, lat)
  }
}

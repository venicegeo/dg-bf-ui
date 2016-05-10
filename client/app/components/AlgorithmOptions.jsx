import React, {Component} from 'react'
import InputTypeBoundingBox, {TYPE_BOUNDINGBOX} from './InputTypeBoundingBox'
import InputTypeFloat, {TYPE_FLOAT} from './InputTypeFloat'
import InputTypeImage, {TYPE_IMAGE} from './InputTypeImage'
import InputTypeInteger, {TYPE_INTEGER} from './InputTypeInteger'
import InputTypeText, {TYPE_TEXT} from './InputTypeText'
import styles from './AlgorithmOptions.less'
import fieldStyles from '../styles/shared/fields.less'

export default class AlgorithmOptions extends Component {
  static propTypes = {
    algorithm: React.PropTypes.object,
    children: React.PropTypes.element,
    images: React.PropTypes.array,
    onSubmit: React.PropTypes.func,
    params: React.PropTypes.object
  }

  constructor() {
    super()
    this._onSubmit = this._onSubmit.bind(this)
  }

  componentDidMount() {
    this.refs.name.value = 'Beachfront_Job_' + Date.now()
  }
  
  render() {
    const {inputs} = this.props.algorithm
    return (
      <form className={styles.root} onSubmit={this._onSubmit}>
        <h2>Algorithm Options</h2>
        <label className={fieldStyles.normal}><span>Job Name</span><input ref="name" type="text" placeholder="Enter a name"/></label>
        {inputs.map(input => this._renderInput(input))}
        <button type="submit">Create Job</button>
      </form>
    )
  }

  _renderInput({key, name, type}) {
    const props = {name, key, ref: key}
    switch (type) {
      case TYPE_BOUNDINGBOX: return <InputTypeBoundingBox {...props}/>
      case TYPE_FLOAT:       return <InputTypeFloat {...props}/>
      case TYPE_IMAGE:       return <InputTypeImage {...props} images={this.props.images}/>
      case TYPE_INTEGER:     return <InputTypeInteger {...props}/>
      case TYPE_TEXT:        return <InputTypeText {...props}/>
    }
    console.warn('Encountered unknown input type `%s`', type)
  }

  get _inputValues() {
    return this.props.algorithm.inputs
      .filter(algorithm => this.refs[algorithm.key])
      .map(algorithm => [algorithm.key, this.refs[algorithm.key].value || null])
  }

  _onSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    const draftJob = {
      algorithmId:   this.props.algorithm.id,
      algorithmName: this.props.algorithm.name,
      name:          this.refs.name.value,
      parameters:    this._inputValues
    }
    this.props.onSubmit(draftJob)
  }
}

import React, {Component} from 'react'
import {createJob, fetchAlgorithms, fetchImageList} from '../api'
import AlgorithmOptions from './AlgorithmOptions'
import styles from './CreateJob.css'

export default class CreateJob extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    params: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {algorithms: [], images: []}
    this._submit = this._submit.bind(this)
  }
  
  componentDidMount() {
    Promise.all([
      fetchAlgorithms(),
      fetchImageList()
    ]).then(([algorithms, images]) => this.setState({algorithms, images}))
  }

  render() {
    const {algorithmId} = this.props.params
    const {algorithms, images} = this.state
    const [selectedAlgorithm] = algorithms
    return (
      <div className={styles.root}>
        <h1>Create Job</h1>
        <h2>Select Algorithm</h2>
        <ul className={styles.algorithms}>
          {algorithms.map(a =>
            <li key={a.id} className={`${styles.algorithm} ${((algorithmId === a.id) && styles.selected) || ''}`}>
              {/*<Link to={`/create-job/${a.id}`}>*/}
                <h3>{a.name}</h3>
                <p dangerouslySetInnerHTML={{__html: a.description}}/>

                <h4>Requirements</h4>
                <table>
                  <tbody>
                    {a.requirements.map(r => <tr key={r.name}><th>{r.name}</th><td>{r.description}</td></tr>)}
                  </tbody>
                </table>
              {/*</Link>*/}
            </li>
          )}
        </ul>
        {selectedAlgorithm && images && (
          <div>
            <AlgorithmOptions algorithm={selectedAlgorithm}
                              images={images}
                              onSubmit={this._submit}/>
          </div>
        )}
      </div>
    )
  }

  _submit(draft) {
    createJob(draft)
      .then(() => {
        // TODO -- flesh out the ideal interaction
        this.context.router.push({pathname: '/jobs'})
      })
      .catch(() => {
        // TODO -- flesh out the ideal interaction
        alert('Submission failed...')  // eslint-disable-line no-alert
      })
  }
}
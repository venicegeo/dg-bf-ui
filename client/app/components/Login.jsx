import React, {Component} from 'react'
import Modal from './Modal'
import styles from './Login.css'
import { withRouter } from 'react-router'
import auth from '../utils/auth.js'

export default class Login extends Component {
    static propTypes = {
        dismiss: React.PropTypes.func,
        router: React.PropTypes.object,
        location: React.PropTypes.object
    }

    constructor(props) {
        super();
        this.state = {error: null}
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleSubmit(event) {
        event.preventDefault()

        const email = this.refs.email.value
        const pass = this.refs.pass.value

        auth.login(email, pass, (loggedIn) => {
            if (!loggedIn) {
                return this.setState({error: true})
            }

            const { location } = this.props

            debugger
            if (location.state && location.state.nextPathname) {
                this.props.router.replace(location.state.nextPathname)
            } else {
                this.props.router.replace('/')
            }
        })
    }


    render() {
        return (
            <Modal className={styles.root} dismiss={this.props.dismiss}>
                <h1>Login</h1>
                <form onSubmit={this.handleSubmit}>
                    <label><input ref="email" placeholder="email" defaultValue="joe@example.com" /></label>
                    <label><input ref="pass" placeholder="password" /></label> (hint: password1)<br />
                    <button type="submit">login</button>
                    {(
                        <p>Bad login information</p>
                    )}
                </form>
            </Modal>
        )
    }

}
Login.propTypes = {
    params: React.PropTypes.object
};
export default withRouter(Login)

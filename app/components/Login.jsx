import React, {Component} from 'react'
import Modal from './Modal'
import styles from './Login.css'
import { withRouter } from 'react-router'
import auth from '../../app/utils/auth.js'
import {authenticate} from '../api'

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

        const username = this.refs.username.value;
        const pass = this.refs.pass.value;

        auth.login(username, pass, (loggedIn) => {
            if (!loggedIn) {
                return this.setState({error: true});
            }
            
            const { location } = this.props;

            if (location.state && location.state.nextPathname) {
                this.props.router.replace(location.state.nextPathname);
            } else {
                this.props.router.replace('/');
            }
        })
    }


    render() {
        return (
            <Modal className={styles.root} dismiss={this.props.dismiss}>
                <h1>Login</h1><br />
                <form onSubmit={this.handleSubmit}>
                    <label><input ref="username" placeholder="username" /></label>&nbsp;&nbsp;
                    <label><input ref="pass" placeholder="password" type="password" /></label> <br /><br />
                    <button type="submit">login</button>
                    {this.state.error && (
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

module.exports = {
    login(username, pass, cb) {
        cb = arguments[arguments.length - 1]
        if (sessionStorage.token) {
            if (cb) cb(true)
            this.onChange(true)
            return
        }

        request(username, pass, (res) => {
            if (res.authenticated) {
                sessionStorage.token = res.token
                if (cb) cb(true)
                this.onChange(true)
            } else {
                if (cb) cb(false)
                this.onChange(false)
            }
        })
    },

    getToken: function () {
        return sessionStorage.token
    },

    logout: function (cb) {
        delete sessionStorage.token
        if (cb) cb()
        this.onChange(false)
    },

    loggedIn: function () {
        return !!sessionStorage.token
    },

    onChange: function () {}
}

function request(username, pass, cb) {

    setTimeout(() => {
        var data = {
            username: username,
            credential: pass
            }
        fetch('https://pz-security.int.geointservices.io/verification', {
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'},
            method: 'POST'
            }
        ).then(function(response) {
            // Convert to JSON
            return response.json();
        }).then(function(authResp) {
            console.log(authResp);
            if (authResp){
            cb
                ({
                    authenticated: true,
                    token: Math.random().toString(36).substring(7)

                })}
            else {
                cb({ authenticated: false })
            }

        })
    }, 0)
}


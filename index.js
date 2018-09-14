const express = require('express')
const request = require('superagent')
const app = express()

const url_login = 'https://graph.facebook.com/v2.6/device/login'

// vim like prompt pls
// or open vim to write message

const authService = {
    getAuthCode: function() {
        return request.post(url_login)
            .set('Accept', 'application/json')
            .query({'access_token': '277395816431577|12f099f41f2be6513bb20dcba2317a79', 'scope': 'user_friends'})
            .end((err, res) => {
                if (err) throw err
                const content = res.body
                
                if (content) {
                    console.log('User code is: ', content.user_code)
                }
            })
    },
    poolUserAuth: function() {
        console.log('hahha')
    }
}


function main () {
    console.log('welcome to msn')
    authService.getAuthCode()
}
main()
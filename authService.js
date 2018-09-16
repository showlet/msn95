const chalk = require('chalk')
const request = require('superagent')
const secretsHandler = require('./secretsHandler')

const url_login = 'https://graph.facebook.com/v2.6/device/login'
const url_login_status = 'https://graph.facebook.com/v2.6/device/login_status'
const url_me = 'https://graph.facebook.com/v2.3/me'
const url_msgs = 'https://graph.facebook.com/v2.3/me'

module.exports = {
    getAuthCode: function() {
        console.info(chalk.gray('Fetching auth code...'))
        return request.post(url_login)
            .set('Accept', 'application/json')
            .query({'access_token': '277395816431577|12f099f41f2be6513bb20dcba2317a79', 'scope': 'user_friends'})
            .then(res => {
                console.info(chalk.gray('Successfully fetched auth code!'))
                return res.body
            })            
            .catch(err => {
                console.log(err)
            })
    },
    getAuthStatus: function(code) {
        console.info(chalk.gray('Fetching access token...'))
        return request.post(url_login_status)
            .set('Accept', 'application/json')
            .query({'access_token': '277395816431577|12f099f41f2be6513bb20dcba2317a79', 'code': code})
            .then(res => {
                console.info(chalk.gray('Successfully fetched acces token!'))
                return res.body
            })            
            .catch(err => {
                console.log(err)
            })
    },
    getMe: function() {
        return secretsHandler.get('access_token').then(token => {
            return request.post(url_me)
                .set('Accept', 'application/json')
                .query({'fields': 'name,picture', 'access_token': token.access_token})
        })
    }
};

const request = require('superagent')
const fs = require('fs')
const express = require('express')
const app = express()

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '~> '
});


const secrets_file = 'secret.txt'
const url_login = 'https://graph.facebook.com/v2.6/device/login'
const url_login_status = 'https://graph.facebook.com/v2.6/device/login_status'
const url_me = 'https://graph.facebook.com/v2.3/me'

// vim like prompt pls
// or open vim to write message
var a = {}

const authService = {
    getAuthCode: function() {
        return request.post(url_login)
            .set('Accept', 'application/json')
            .query({'access_token': '277395816431577|12f099f41f2be6513bb20dcba2317a79', 'scope': 'user_friends'})
            .then(res => res.body) 
            .catch(err => {
                console.log(err)
            })
    },
    getAuthStatus: function(code) {
        return request.post(url_login_status)
            .set('Accept', 'application/json')
            .query({'access_token': '277395816431577|12f099f41f2be6513bb20dcba2317a79', 'code': code})
            .then(res => res.body)            
            .catch(err => {
                console.log(err)
            })
    },
    getMe: function(acces_token) {
        return request.post(url_me)
            .set('Accept', 'application/json')
            .query({'fields': 'name,picture', 'access_token': acces_token})
    }
};

(() => {
    const codes = { auth_code: '', acces_token: '' }

    console.log('welcome to msn')

    rl.prompt() // non-blocking

    rl.on('line', (line) => {
        switch (line.trim()) {
          case '1':
            authService.getAuthCode().then(content => {
                console.log('User code is: ', content.user_code)
                codes.auth_code = content.code

                fs.access(secrets_file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
                    if (err) {
                        fs.writeFile(secrets_file, content, (err) => {
                            if (err) throw err;
                        })
                    } else {
                        fs.readFile(secrets_file, 'utf-8', (err, data) => {
                            if (err) throw err;
                            console.log('auth token', JSON.stringify(data))
                            // codes.auth_code = data
                        })
                    }
                });


                console.log('Registered code', codes.auth_code)
                console.log('Once you permitted the device to be signed in, enter: 2')
                rl.prompt();
            })
            break;
          case '2':
          console.log('auth codde', codes.auth_code)
            authService.getAuthStatus(codes.auth_code)
                .then(code => {
                    console.log('CODE', code)
                    rl.prompt();
                }).catch(err => {
                    console.log('erreur grave', err)
                })
            break;
          case '3':
            authService.getMe(acces_token)
                .end((err, res) => {
                    const content = res.body
                    if (content) {
                        console.log(content)
                    }
                    rl.prompt();
                })

            break;
          default:
            console.log(`dafuck you sayin lil shit?`);
            rl.prompt();
            break;
        }
      }).on('close', () => {
        console.log('Have a great day!');
        process.exit(0);
      });
    
})()
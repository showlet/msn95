const request = require('superagent')
const fs = require('fs')
const express = require('express')
const app = express()
const chalk = require('chalk')
const cfonts = require('cfonts')

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '~> '
});

const cache_file = '/tmp/msn95_cache.json'
const url_login = 'https://graph.facebook.com/v2.6/device/login'
const url_login_status = 'https://graph.facebook.com/v2.6/device/login_status'
const url_me = 'https://graph.facebook.com/v2.3/me'

// vim like prompt pls
// or open vim to write message
// oh and encrypt the damn auth key :/ 

const cacheHandler = {
    exists: function() {
        return new Promise((resolve, reject) => {
            fs.access(cache_file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
                if (err) {
                    this.create().then(() => resolve()).catch(err => { if (err) throw err; })
                } else {
                    resolve()
                }
            })
        })
        
    },
    create: async function() {
        return await fs.writeFile(cache_file, '{}', (err) => { if (err) throw err; })
    },
    set: async function(key, val) {
        return await this.exists().then(() => {
            fs.readFile(cache_file, (err, data) => {
                if (err) throw err;
                if (data) {
                    const parsedData = JSON.parse(data.toString())
                    parsedData[key] = JSON.stringify(val)
                    const stringifiedData = JSON.stringify(parsedData)
                    fs.writeFile(cache_file, stringifiedData, (err) => {
                        if (err) throw err;
                    })
                }
            })
        }).catch(err => { 
            return this.create().then(() => this.set(key, val))
        })
    },
    get: function(key) {
        return new Promise ((resolve, reject) => {
            this.exists().then(() => {
                fs.readFile(cache_file, (err, data) => {
                    if (err) throw err;
                    if (data) {
                        const parsedData = JSON.parse(data.toString())
                        if (parsedData[key]) {
                            resolve(parsedData[key])
                        } else {
                            resolve(null)
                        }
                    }
                })
            })
        })
    }
}


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
    },
    getTokenFromFile: function() {
        // TODO use the cacheHandler pls
        return new Promise((resolve, reject) => {
            return fs.access(cache_file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
                    if (err) {
                        fs.writeFile(cache_file, '{}', (err) => { 
                            if (err) throw err; 
                            reject('NEWFILE')
                        })
                    } else {
                        fs.readFile(cache_file, 'utf-8', (err, data) => {
                            if (err) reject(err);
                            data = JSON.parse(data)

                            if (data.access_token) {
                                // todo check if it is expired, reject if yea
                                console.log('auth token', JSON.stringify(data))
                                console.log('DATE', new Date())
                                resolve(data)
                            } else {
                                reject('NO_TOKEN')
                            }
                       })
                    }
                })
        })
    }
};


(() => {
    const codes = { auth_code: '', acces_token: '' }

    cfonts.say('msn95', {
        font: 'chrome',              
        align: 'left',              
        colors: ['magenta', 'cyan', 'white'],       
        background: 'transparent',  
        letterSpacing: 3,    
        lineHeight: 3,       
        space: true,
        maxLength: '0',
    });


    rl.prompt() // non-blocking

    rl.on('line', (line) => {
        switch (line.trim()) {
          case '1':
            authService.getAuthCode().then(content => {
                console.log('User code is: ', content.user_code)

                cacheHandler.set('auth_code', content).then(() => {
                    codes.auth_code = content.code
                    console.log('Registered code', codes.auth_code)
                    console.log('Once you permitted the device to be signed in, enter: 2')
                    rl.prompt();
                })
            })
            break;
          case '2':
            authService.getTokenFromFile().then(token => {
                    codes.acces_token = token
                    console.log('TOKEEEN from the file :) ', token)
                    rl.prompt();
                }).catch(err => {
                    if (err) {
                        console.error(err)
                        authService.getAuthStatus(codes.auth_code)
                            .then(code => {
                                console.log('CODE', code)
                                cacheHandler.set('access_token', code).then(() => {
                                    codes.acces_token = code
                                    rl.prompt();
                                })
                            }).catch(err => {
                                console.log('erreur grave', err)
                            }) 
                    }
                    rl.prompt();
                })
            break;
          case '3':
          console.log('Access token:', codes.acces_token)
            authService.getMe(codes.acces_token.access_token)
                .end((err, res) => {
                    const content = res.body
                    if (content) {
                        console.log(content)
                    }
                    rl.prompt();
                })

            break;
          case 't1':
            cacheHandler.set('test', 'abc1256').then(() => {
                cacheHandler.get('test').then((test) => console.log(chalk.yellow('test', test)))
            })
            break;
          default:
            console.log(`dafuck you sayin lil shit?`);
            rl.prompt();
            break;
        }
      }).on('close', () => {
        console.log('Right, go away.');
        process.exit(0);
      });
})()

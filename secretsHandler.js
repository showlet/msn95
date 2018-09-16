
const fs = require('fs')

const secrets_file = '/tmp/msn95_secrets.json'

module.exports = {
    exists: function() {
        return new Promise((resolve, reject) => {
            fs.access(secrets_file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
                if (err) {
                    this.create().then(() => resolve()).catch(err => { if (err) throw err; })
                } else {
                    resolve()
                }
            })
        })
        
    },
    create: async function() {
        return await fs.writeFile(secrets_file, '{}', (err) => { if (err) throw err; })
    },
    set: async function(key, val) {
        return await this.exists().then(() => {
            fs.readFile(secrets_file, (err, data) => {
                if (err) throw err;
                if (data) {
                    const parsedData = JSON.parse(data.toString())
                    parsedData[key] = JSON.stringify(val)
                    const stringifiedData = JSON.stringify(parsedData)
                    fs.writeFile(secrets_file, stringifiedData, (err) => {
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
                fs.readFile(secrets_file, (err, data) => {
                    if (err) throw err;
                    if (data) {
                        const parsedData = JSON.parse(data.toString())
                        if (parsedData[key]) {
                            resolve(JSON.parse(parsedData[key]))
                        } else {
                            resolve(null)
                        }
                    }
                })
            })
        })
    }
};


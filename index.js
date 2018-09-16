const chalk = require('chalk')
const cfonts = require('cfonts')
const authService = require('./authService')
const secretsHandler = require('./secretsHandler')

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'msn95> '
});


// vim like prompt pls
// or open vim to write message
// oh and encrypt the damn auth secrets file :/ 


(() => {
    cfonts.say('msn95', {
        font: 'chrome',              
        align: 'left',              
        colors: ['magenta', 'cyan', 'white'],       
        background: 'transparent',  
        letterSpacing: 3,    
        lineHeight: 1,       
        space: true,
        maxLength: '0',
    });


    rl.prompt() // non-blocking

    rl.on('line', (line) => {
        switch (line.trim()) {
          // get the user code and auth_code
          case '1':
            authService.getAuthCode().then(content => {
                console.log(chalk.magenta('User code is: ', content.user_code))
                secretsHandler.set('auth_code', content).then(() => {
                    console.log(chalk.cyan('Go to: ', content.verification_uri, ' and confirm the device.'))
                    console.log(chalk.cyan('Once you permitted the device to be signed in, enter: 2'))
                    rl.prompt();
                })
            })
            break;
          case '2':
            secretsHandler.get('auth_code').then(code => {
                authService.getAuthStatus(code.code).then(token => {
                    secretsHandler.set('access_token', token).then(() => {
                        rl.prompt()
                    })
                }).catch(err => {
                    throw err
                }) 
            })
            break;
          // get current logged in user
          case '3':
            authService.getMe().then(res => {
                const content = res.body
                if (content) {
                    console.log(content)
                }
                rl.prompt();
            }).catch(err => { throw err; })
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

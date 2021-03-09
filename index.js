const Nightmare = require('nightmare')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const request = require('request')

/**
 * Your Pinterest email/password to login as...
 */
const your_email = 'your pinterest email'
const your_password = 'your pinterest password'
const search_keyword = 'pretty lady'
const downloadDir = 'downloads'
const maxImages = 10

/**
 * These are CSS selectors to elements on Pinterest.
 * 
 * Most likely over time Pinterest will change their website and
 * these selectors will need to be updated to match what's on their current website.
 */
const login_button = 'button.Il7'
const login_form = 'form[data-test-id]'
const search = 'input[name=searchBoxInput]'
const pinned_image = 'div[data-test-id=pinWrapper] div[data-test-id=non-story-pin-image] img'

const nightmare = Nightmare({
    show: true, // hides electron window
    /**
     * Uncomment this if and .authentication() you want to use proxies.
     * 
     * proxy-server = Your proxy server IP address
     */
    //switches: {
    //    'proxy-server': '1.2.3.4:5678',
    //    'ignore-certificate-errors': true
    //}
})

nightmare
    .viewport(1240, 760)
    //.authentication('proxyUsername', 'proxyPassword')
    .goto('https://www.pinterest.com/')
    .wait(login_button)
    .click(login_button)
    .wait(login_form)
    .type('#email', your_email)
    .type('#password', your_password)
    .click('button.SignupButton')
    .wait(search)
    .wait(3000) // wait for 3 seconds
    .type(search, search_keyword + '\u000d')
    .wait(pinned_image)
    .evaluate(() => document.querySelector('body').innerHTML)
    .end()
    .then(response => {
        downloadImages(response, maxImages);
    }).catch(err => {
        console.log(err);
    });

const downloadImages = (html, num_images) => {
    const $ = cheerio.load(html);

    $(pinned_image).each((i, elem) => {
        let image_src = $(elem).attr('src')
        let image_filename = path.join(downloadDir, path.basename(image_src))

        download(image_src, image_filename, () => {})

        if (i >= num_images) {
            return false
        }
    })
}

const download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
class HomeController {
    index(req, res) {
        res.send('Home Page')
    }
}

module.exports = new HomeController();
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
var fs = require('fs');
const app = express();

app.use(fileUpload({
    createParentPath: true
}));

app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3000;

app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);

app.get('/', async (req, res) => {
    res.render('index')
})


app.post('/uploaded', async (req, res) => {
    try {
        if(!req.files) {
            throw "A file is needed to be uploaded!"
        } else {
            let logo = req.files.logo;
            if (!(logo.mimetype.startsWith("image/"))) {
                throw "Must be an image >:{"
            }
            logo.mv('./uploads/' + logo.name);
            var Dip = {
                House: req.body.Rhouse,
                FName: req.body.FName,
                LName: req.body.LName,
                Year: req.body.Year,
                Name: logo.name.replace(/\.[^/.]+$/, ""),
                Format: logo.mimetype.slice(6)
            };

            Dip["Path"] = `${Dip.House}_${Dip.FName}_${Dip.LName}_${Dip.Year}_${Dip.Name}`

            if (!Dip.FName | !Dip.LName) {
                throw "You MUST give your name!"
            }

            if (!(Dip.Year.match(/(^[1-9]+.[1-4]$)/))) {
                throw "The year field must be in the following format: \"11.1\" or \"9.3\" etc"
            }

            fs.rename(`./uploads/${logo.name}`, `./uploads/${Dip.Path}.${Dip.Format}`, (err) => {
                if (err) {
                    throw "Hm somethin happened, please contact the SC & well solve it :D"
                } else {
                    console.log(`${Dip.House} - ${Dip.FName}_${Dip.LName}`)
                }
            })

            res.render("succ", {R: Dip});
        }
    } catch (err) {
        console.log(err)
        res.status(500).render("error", {error: err});
    }
});

app.get('/uploads/:file', async (req, res) => {
    res.sendFile(`${__dirname}/uploads/${req.params.file}.${req.query.format}`)
})


app.get('/uploadlist', async (req, res) => {
    let response = ""
    for (fileName of fs.readdirSync('./uploads')) {
        resp = fileName.split("_")
	response += `${resp[0]} - ${resp[1]} ${resp[2]} ${fileName} <br />`
    }
    res.send(response)
})

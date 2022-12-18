import express from 'express'
// import mongoose from 'mongoose'
import {getLatLongByUrl, getWeatherByUrl, utils as u} from './utils.js';

import {fileURLToPath} from 'url';
import path from 'path';
import hbs from 'hbs';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'dev') {
    dotenv.config({path: path.join(__dirname, '.env')});
}

u.log('__dirname', __dirname); // directory where current script lives
u.log('path.join(__dirname, \'..\')', path.join(__dirname, '..'));
u.log('__filename', __filename); // to file itself

const app = express();
const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './views');
const partialPath = path.join(__dirname, './partials');

// setup handlebars engine and views location:
app.set('view engine', 'hbs');
app.set('views', viewsPath);
// регистрируем путь к partials:
hbs.registerPartials(partialPath);

// setup static directory to serve:
app.use(express.static(publicDirectoryPath));

app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather page',
        name: 'KS'
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About page',
        name: 'KS'
    });
});

app.get('/weather', async (req, res) => {
    if (!req.query.address) {
        return res.send({
            error: 'You must provide an address'
        });
    }
    const {coordinates, place_name: location} = await getLatLongByUrl(req.query.address);
    if (!coordinates || coordinates.hasOwnProperty('error')) {
        return res.send({
            error: coordinates?.error ? coordinates?.error : `We did not find coordinate for ${req.query.address}`
        });
    }

    const [long, lat] = coordinates,
        currentConditions = await getWeatherByUrl({lat, long});
    if (!currentConditions || currentConditions.hasOwnProperty('error')) {
        return res.send({
            error: currentConditions?.error ? currentConditions?.error : `We did not find Conditions for ${req.query.address}`
        });
    }
    res.send({
        forecast: `It is currently ${currentConditions.temp} degrees Celsius.` +
            ` There s a ${currentConditions.precipprob} chance of rain.`,
        location,
        address: req.query.address
    });
});

app.get('/products', (req, res) => {
    u.log('req.query', req.query); // query string
    if (!req.query.search) {
        return res.send({
            error: 'You must provide a search term'
        });
    }
    res.send({
        products: []
    });
});

app.get('/help', (req, res) => {
    res.render('help', {
        title: 'Help page',
        name: 'KS'
    });
});

app.get('/help/*', (req, res) => {
    res.render('404', {
        textError: 'Help article not found'
    });
});

app.get('*', (req, res) => {
    res.render('404', {
        textError: 'Page not found'
    });
});

app.listen(3004, () => {
    u.log('Server is up on port 3004');
});

// 67d
import chalk from 'chalk';
import got from 'got';
import * as dotenv from 'dotenv';
dotenv.config();

// import {fileURLToPath} from 'url';
// import path from "path";
// const __filename = fileURLToPath(import.meta.url);
// console.log('__filename: ', __filename);
// const __dirname = path.dirname(__filename);
// console.log('__dirname: ', __dirname);

const wrapFu = function ({isErr}) {
    let isError = isErr;
    return function (description = '', ...values) {
        let bgColor = 'bgBlack',
            bgColorFirst = 'bgBlueBright';

        if (isError) {
            bgColor = 'bgRedBright';
        }

        if (typeof description === 'object' && description !== null) {
            console.log(chalk[bgColor].whiteBright(`${JSON.stringify(description)}`));
            return;
        }
        let arrVal, pr = ' ', sf = ' ';
        if (Array.isArray(values[0])) {
            arrVal = values[0];
            pr = '[\n ';
            sf = ' \n]';
        } else {
            arrVal = values;
        }

        if (values.length === 0) {
            console.log(chalk[bgColor].whiteBright(` ${description} `));
            return;
        }

        console.group(chalk[bgColorFirst].whiteBright(`${description}:`))
        arrVal.forEach((v, i) => console.log(
            chalk[bgColor].whiteBright((i == 0 ? pr : ' ') + `${typeof v === 'object' && v !== null ? JSON.stringify(v) : v}` + (i == arrVal.length - 1 ? sf : ' '))));
        console.groupEnd();
    }

}

let log = wrapFu({isErr: false});
let error = wrapFu({isErr: true});

export const utils = {
    log,
    error
}

export const getLatLongByUrl = async (address) => {
    try {
        const coordinateURL = `https://api.maptiler.com/geocoding/
            ${encodeURIComponent(address)}.json?key=${process.env.MAPTILER_KEY}&language=ru`
        const data = await got.get(coordinateURL, {}).json();
        if (data.features.length === 0) {
            throw new Error('City is not exist')
        }
        const coordinates = data.features[0]?.center;
        return { coordinates, place_name: data.features[0].place_name };
    } catch (e) {
        return {error: e.toString()};
    }
}

export const getWeatherByUrl = async ({lat, long} = {}) => {
    try {
        const weatherURL =
            `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/
            ${lat},${long}?unitGroup=metric&key=${process.env.VISUALCROSSING_KEY}&contentType=json`;
        const data = await got.get(weatherURL, {}).json();
        return data.currentConditions;
    } catch (e) {
        return {error: e.toString()};
    }
}

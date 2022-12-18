const getForecast = (address, cb) => {
    fetch(`/weather?address=${address}`)
        .then((res) => {
            res.json().then((data) => {
                cb(data);
            });
        });
};

const weatherForm = document.querySelector('form'),
    message1 = document.getElementById('message-1'),
    message2 = document.getElementById('message-2');

weatherForm.addEventListener('submit', (ev) => {
    message1.innerText = '';
    message2.innerText = 'Loading...';
    ev.preventDefault();
    let address = ev.target[0].value;
    getForecast(address, (data) => {
        message2.innerText = '';
        if (data.error) {
            message1.innerText = data.error;
            return;
        }
        message2.innerText = '';
        message1.innerText = data.location + ': \n' + data.forecast;
    });
});

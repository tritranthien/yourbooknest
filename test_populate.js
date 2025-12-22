const http = require('http');

http.get('http://localhost:3000/novels/newest', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const first = json[0];
            console.log('Title:', first.title);
            console.log('Author type:', typeof first.author);
            console.log('Author:', first.author);
            console.log('Category type:', typeof first.category);
            console.log('Category:', first.category);
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (err) => {
    console.error(err.message);
});

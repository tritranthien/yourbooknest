const mongoose = require('mongoose');

async function check() {
    await mongoose.connect('mongodb://localhost:27017/yourbooknest');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(collections.map(c => c.name));
    await mongoose.disconnect();
}

check().catch(console.error);

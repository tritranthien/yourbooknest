const mongoose = require('mongoose');

const mongoUri = 'mongodb://localhost:27017/yourbooknest';

async function seed() {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const { db } = mongoose.connection;

    // Clean up
    await db.collection('users').deleteMany({});
    await db.collection('authors').deleteMany({});
    await db.collection('cates').deleteMany({});
    await db.collection('novels').deleteMany({});
    await db.collection('chaps').deleteMany({});

    // 1. Create a dummy user (poster)
    const userResult = await db.collection('users').insertOne({
        username: 'admin',
        password: 'password123',
        email: 'admin@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
    });
    const userId = userResult.insertedId;

    // 2. Create Categories (Collection: cates)
    const catNames = ['Tiên Hiệp', 'Huyền Huyễn', 'Khoa Huyễn', 'Ngôn Tình'];
    const categories = [];
    for (const name of catNames) {
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
        const res = await db.collection('cates').insertOne({ cate: name, slug, createdAt: new Date(), updatedAt: new Date() });
        categories.push({ _id: res.insertedId, cate: name, slug });
    }

    // 3. Create Authors (Collection: authors)
    const authNames = ['Thiên Tằm Thổ Đậu', 'Mạc Mặc', 'Loạn', 'Đường Gia Tam Thiếu'];
    const authors = [];
    for (const name of authNames) {
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
        const res = await db.collection('authors').insertOne({ name, slug, createdAt: new Date(), updatedAt: new Date() });
        authors.push({ _id: res.insertedId, name, slug });
    }

    // 4. Create Novels (Collection: novels)
    const novels = [
        {
            title: 'Đấu Phá Thương Khung',
            slug: 'dau-pha-thuong-khung',
            description: 'Một thế giới thuộc về Đấu Khí, không có ma pháp hoa lệ, chỉ có Đấu Khí đỉnh cao!',
            image: 'https://img.dtruyen.com/public/images/dauphathuongkhung.jpg',
            author: authors[0]._id,
            category: categories[0]._id,
            poster: userId,
            modvote: true,
            views: 1000,
            likes: 500,
            scores: 45,
            rate_nums: 10,
            status: 'continue',
            updatedAt: new Date(),
            createdAt: new Date()
        },
        {
            title: 'Võ Luyện Điên Phong',
            slug: 'vo-luyen-dien-phong',
            description: 'Võ đạo đỉnh phong, là cô độc, là tịch mịch, là không ngừng vươn xa...',
            image: 'https://img.dtruyen.com/public/images/voluyndienphong.jpg',
            author: authors[1]._id,
            category: categories[1]._id,
            poster: userId,
            modvote: true,
            views: 2000,
            likes: 800,
            scores: 50,
            rate_nums: 12,
            status: 'continue',
            updatedAt: new Date(),
            createdAt: new Date()
        },
        {
            title: 'Toàn Chức Pháp Sư',
            slug: 'toan-chuc-phap-su',
            description: 'Tỉnh lại sau một giấc ngủ, thế giới đã thay đổi. Trường học dạy ma pháp...',
            image: 'https://img.dtruyen.com/public/images/toanchucphapsu.jpg',
            author: authors[2]._id,
            category: categories[2]._id,
            poster: userId,
            modvote: false,
            views: 500,
            likes: 200,
            scores: 30,
            rate_nums: 5,
            status: 'completed',
            updatedAt: new Date(),
            createdAt: new Date()
        }
    ];

    await db.collection('novels').insertMany(novels);

    console.log('Seed data inserted successfully with correct collection names');
    await mongoose.disconnect();
}

seed().catch(err => console.error(err));

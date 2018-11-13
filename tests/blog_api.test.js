const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: 'Blogien Maailma',
        author: 'Elämä',
        url: 'termospullo',
        likes: 0
    },
    {
        title: 'Blogien elämä',
        author: 'Kuolema',
        url: 'tinakenkatytto',
        likes: 2
    }
]


beforeAll(async () => {
    await Blog.remove({})

    for (let blog of initialBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

test('blogs are returned as json and HTTP GET request works', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
    const response = await api
        .get('/api/blogs')
    expect(response.body.length).toBe(2)
})

test('HTTP POST request works', async () => {
    const newBlog = {
        title: 'Blogien Muailma',
        author: 'Ellämmä',
        url: 'teremospullo',
        likes: 4
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const response = await api
        .get('/api/blogs')

    const titles = response.body.map(a => a.title)

    expect(response.body.length).toBe(initialBlogs.length + 1)
    expect(titles).toContain('Blogien Maailma')
})

test.only('If likes are not given a value, it should be 0', async () => {
    const newBlog = {
        title: 'Blog world',
        author: 'Life',
        url: 'termos can',
        likes: 0
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const response = await api
        .get('/api/blogs')

        console.log('tulos: ', response.body)

    expect(response.body.likes).toBe(0)
})

test('the first blog´s title is `Blogien maailma`', async () => {
    const response = await api
        .get('/api/blogs')

    expect(response.body[0].title).toBe('Blogien Maailma')
})

afterAll(() => {
    server.close()
})
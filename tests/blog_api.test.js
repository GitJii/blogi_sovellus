const supertest = require('supertest')
const bcrypt = require('bcrypt')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, format, nonExistingId, blogsInDb, usersInDb } = require('./test_helper')

let userId

const createUser = async (name, username, password) => {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })
    return await user.save()
}

describe('when database has been initialized ', async () => {
    beforeAll(async () => {
        const user = await createUser('tero', 'salaisuus', 'jussi')
        userId = user._id

        await Blog.remove({})

        for (let blog of initialBlogs) {
            let blogObject = new Blog(blog)
            await blogObject.save()
        }
    })
    describe('HTTP GET requests', async () => {
        test('blogs are returned as json and HTTP GET request works', async () => {
            const blogsBefore = await blogsInDb()

            await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsAfter = await blogsInDb()

            expect(blogsAfter.length).toBe(blogsBefore.length)

            const titles = blogsAfter.map(b => b.title)
            blogsBefore.forEach(blog => {
                expect(titles).toContain(blog.title)
            })
        })

        test('there is two blogs', async () => {
            const blogsBefore = await blogsInDb()

            await api
                .get('/api/blogs')

            const blogsAfter = await blogsInDb()

            expect(blogsAfter.length).toBe(blogsBefore.length)
            expect(blogsAfter.length).toBe(2)
        })

        test('individual blogs are returned as json when request is GET to path /api/blogs/:id', async () => {
            const blogsInDatabase = await blogsInDb()
            const firstBlog = blogsInDatabase[0]

            /*
            console.log('firstbblog is: ', firstBlog)
            console.log('firstblog.id: ', firstBlog.id)
            console.log('blogsInDatabase: ', blogsInDatabase)
    */
            await api
                .get(`/api/blogs/${firstBlog.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            expect(blogsInDatabase[0].title).toBe(firstBlog.title)
        })

        test('404 returned when request is GET /api/blogs/:id nonexisting proper id', async () => {
            const properNonexistingId = await nonExistingId()

            const blogsBefore = await blogsInDb()

            await api
                .get(`/api/blogs/${properNonexistingId}`)
                .expect(404)

            const blogsAfter = await blogsInDb()

            expect(blogsAfter.length).toBe(blogsBefore.length)
        })

        test('400 is returned when request is GET /api/blogs/:id with invalid id', async () => {
            const invalidId = "12398"

            const blogsBefore = await blogsInDb()

            await api
                .get(`/api/blogs/${invalidId}`)
                .expect(400)

            const blogsAfter = await blogsInDb()

            expect(blogsAfter.length).toBe(blogsBefore.length)
        })
        test('the first blog´s title is `Blogien maailma`', async () => {
            const blogsBefore = await blogsInDb()

            const response = await api
                .get('/api/blogs')

            const blogsAfter = await blogsInDb()

            expect(blogsAfter.length).toBe(blogsBefore.length)
            expect(response.body[0].title).toBe('Blogien Maailma')
        })
    })
    describe('HTTP POST requests', async () => {
        test('HTTP POST request works', async () => {
            const blogsBefore = await blogsInDb()

            const newBlog = {
                title: 'Blogien Muailma',
                author: 'Ellämmä',
                url: 'teremospullo',
                likes: 0,
                userId: userId
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsAfter = await blogsInDb()
            const blogsFinal = await blogsAfter.map(Blog.format)
            const blogsTitles = blogsFinal.map(b => b.title)

            expect(blogsAfter.length).toBe(blogsBefore.length + 1)
            expect(blogsTitles).toContainEqual(newBlog.title)
        })

        test('If request doesnt include fields title and url, request is responded  with bad request 400', async () => {

            const newBlog = {
                author: 'Tekijä',
                likes: 0
            }
            const blogsBefore = await blogsInDb()

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const blogsAfter = await blogsInDb()

            expect(blogsAfter.length).toBe(blogsBefore.length)
        })

        test('If likes are not given a value, it should be 0', async () => {

            const newBlog = {
                title: 'Blog world',
                author: 'Life',
                url: 'termos can',
                userId: userId
            }

            const blogsBefore = await blogsInDb()

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsAfter = await blogsInDb()

            expect(blogsBefore.length).toBe(blogsAfter.length - 1)
            expect(blogsAfter[blogsAfter.length - 1].likes).toBe(0)
        })
    })
    describe('HTTP DELETE request tests', async () => {
        test('HTTP DELETE request actually works', async () => {

            const blogsBefore = await blogsInDb()

            const newBlog = {
                title: 'Blogit',
                author: 'Elä',
                url: 'terpullo',
                likes: 0,
                userId: userId
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsMiddle = await blogsInDb()

            await api
                .delete(`/api/blogs/${blogsMiddle[blogsMiddle.length - 1].id}`)
                .expect(204)

            const blogsAfter = await blogsInDb()
            const blogsFinal = blogsAfter.map(Blog.format)

            expect(blogsAfter.length).toBe(blogsBefore.length)
            expect(blogsFinal).not.toContainEqual(newBlog.title)
        })
    })
    describe('HTTP PUT request tests', async () => {
        test('HTTP PUT request acutally works', async () => {
            const blogsBefore = await blogsInDb()

            const newBlog = {
                title: 'Blogit',
                author: 'Elää ja kuolla',
                url: 'termos',
                likes: 0,
                userId: userId
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsMiddle = await blogsInDb()

            await api
                .put(`/api/blogs/${blogsMiddle[blogsMiddle.length - 1].id}`)
                .send(newBlog)
                .expect(200)

            const blogsAfter = await blogsInDb()

            expect(blogsAfter[blogsAfter.length - 1].likes).toBe(blogsMiddle[blogsMiddle.length - 1].likes + 1)
            expect(blogsAfter.length).toBe(blogsBefore.length + 1)
        })
    })
    describe('when there is one user at db at first', async () => {
        beforeAll(async () => {
            await User.remove({})
            const user = new User({ username: 'pera', password: 'salaisuus' })
            await user.save()
        })

        test('POST /api/users succeeds with a new username', async () => {
            const usersBefore = await usersInDb()

            const newUser = {
                username: 'teroTin',
                name: 'Tero Tinto',
                password: 'salaisuus'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const usersAfter = await usersInDb()
            expect(usersAfter.length).toBe(usersBefore.length + 1)

            const usernames = usersAfter.map(u => u.username)
            expect(usernames).toContain(newUser.username)
        })

        test('POST /api/users fails with right statuscode and right message(username is taken)', async () => {
            const usersBefore = await usersInDb()

            const newUser = {
                username: 'pera',
                name: 'Pena Rahikainen',
                password: 'salamies'
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body).toEqual({ error: 'username has to be unique' })

            const usersAfter = await usersInDb()
            expect(usersAfter.length).toBe(usersBefore.length)
        })

        test('POST /api/users fails with too short password (less than 3 characters) ', async () => {
            const usersBefore = await usersInDb()

            const newUser = {
                username: 'petteri',
                name: 'Petteri Rahikainen',
                password: 'pr'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body).toEqual({ error: 'password too short' })

            const usersAfter = await usersInDb()
            expect(usersAfter.length).toBe(usersBefore.length)
        })

        test('POST /api/users if not set, new user is adult', async () => {
            const usersBefore = await usersInDb()

            const newUser = {
                username: 'petteri',
                name: 'Petteri Rahikainen',
                password: 'pro'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const usersAfter = await usersInDb()
            console.log('usersAfter[usersAfter.length - 1].adult', usersAfter[usersAfter.length - 1].adult)
            expect(usersAfter[usersAfter.length - 1].adult).toBe(true)
            expect(usersAfter.length).toBe(usersBefore.length + 1)
        })
    })

    afterAll(() => {
        server.close()
    })
})
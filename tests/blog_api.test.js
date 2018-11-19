const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, format, nonExistingId, blogsInDb } = require('./test_helper')


describe('when database has been initialized ', async () => {
    beforeAll(async () => {
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
                likes: 0
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsAfter = await blogsInDb()
            const blogsFinal = await blogsAfter.map(b => format(b))
            /* Yllä formattoidaan blogsAfteriin kuuluva id pois */
            /*
                const response = await api
                        .get('/api/blogs')
             */
            /*
                       const titles = response.body.map(a => a.title)
             */


            expect(blogsAfter.length).toBe(blogsBefore.length + 1)
            expect(blogsFinal).toContainEqual(newBlog)
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
                likes: 0
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
            const blogsFinal = blogsAfter.map(b => b.title)

            expect(blogsAfter.length).toBe(blogsBefore.length)
            expect(blogsFinal).not.toContainEqual(newBlog.title)
        })

        afterAll(() => {
            server.close()
        })
    })
})
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

const formatBlog = (blog) => {
  return {
    id: blog._id,
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes
  }
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(formatBlog))

  /*
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
*/
})

blogsRouter.post('/', async (request, response) => {

  try {
    const body = request.body

    if (body.title === undefined) {
      return response.status(400).json({ error: 'title missing' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author === undefined ? 'unknown author' : body.author,
      url: body.url === undefined ? 'unknown url' : body.url,
      likes: 0
    })

    const savedBlog = await blog.save()
    response.json(formatBlog(savedBlog))

  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
  /*
    blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
  */
})

module.exports = blogsRouter
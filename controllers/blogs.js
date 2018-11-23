const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

/*
const formatBlog = (blog) => {
  return {
    id: blog._id,
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes
  }
}
*/

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'title or url missing' })
    }

    const user = await User.findById(body.userId)

    const blog = new Blog({
      title: body.title,
      author: body.author === undefined ? 'unknown author' : body.author,
      url: body.url === undefined ? 'unknown url' : body.url,
      likes: 0,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.json(Blog.format(blog))

  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)

    if (blog) {
      response.json(Blog.format)
    } else {
      response.status(404).end()
    }

  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)

    response.status(204).end()
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const body = await request.body

    console.log('body: ', body)

    const updatedBlog = {
      author: body.author,
      title: body.title,
      url: body.url,
      likes: body.likes + 1
    }

    await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true })

    response.status(200).end()

  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'something went wrong' })
  }
})

module.exports = blogsRouter
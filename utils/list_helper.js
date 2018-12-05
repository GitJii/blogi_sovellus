const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {

    const listOfLikes = blogs.map(blog => {
        return blog.likes
    })

    const reducer = (sum, item) => {
        return sum + item
    }

    return listOfLikes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {

    if (blogs[0] === undefined) {
        return 0
    } else {
        return blogs.reduce((max, comp) => {
            return (max.likes > comp.likes) ? max : comp
        })
    }
}

const mostBlogs = (blogs) => {

    const countedBlogs = blogs.reduce((allBlogs, blog) => {
        if (blog.author in allBlogs) {
            allBlogs[blog.author]++
        } else {
            allBlogs[blog.author] = 1
        }
        return allBlogs
    }, {})

    const mostBlogsAmount = Object.entries(countedBlogs).map(obj => obj[1]).sort((a, b) => b - a)[0]

    const authorWithMostBlogs = Object.entries(countedBlogs).map(obj => {
        if (obj[1] === mostBlogsAmount) {
            return obj[0]
        }
    }).filter(author => {
        if (author !== undefined) {
            return author
        }
    })[0]

    const result = {
        author: authorWithMostBlogs,
        blogs: mostBlogsAmount
    }

    return result
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}
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
    /* Funktio selvittää kirjoittajan, kenellä on 
    eniten blogeja. Funktion paluuarvo kertoo myös
     ennätysbloggaajan blogien määrän */

    const countedLikes = blogs.reduce((allAuthors, author) => {
        if (author in allAuthors) {
            allAuthors[author]++
        } else {
            allAuthors[author] = 1
        }
        return allAuthors
    }, {})
    console.log('countedLikes: ', countedLikes)
    
    return countedLikes
    /*
        if (blogs[0] === undefined) {
            return 0
        } else {
            blogs.reduce((author, blog) => {
                return author + blog[author]
            })
        }
        */
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}
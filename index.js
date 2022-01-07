const { ApolloServer } = require('apollo-server')


var _id = 0

var users = [
    { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
    { "githubLogin": "gPlake", "name": "Glen Plake" },
    { "githubLogin": "sSchmidt", "name": "Scot Schmidt" }
]

var tags = [
    { "photoID": "1", "userID": "gPlake" },
    { "photoID": "2", "userID": "sSchmidt" },
    { "photoID": "2", "userID": "mHattrup" },
    { "photoID": "2", "userID": "gPlake" }
]

var photos = [{
        "id": "1",
        "name": "Dropping the Heart Chute",
        "description": "The heart chute is one of my favorite chutes",
        "category": "ACTION",
        "githubUser": "gPlake"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt"
    },
    {
        id: "3",
        "name": "Gunbarrel 25",
        "description": "25 laps on gunbarrel today",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt"
    }
]

const typeDefs = `

    scalar DateTime

    enum PhotoCategory{
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }

    input PhotoPostInput{
        name:String!
        description:String
        category:PhotoCategory = PORTRAIT
    }

    type User{
        githubLogin:ID!
        name:String
        avatar:String
        postedPhotos:[Photo!]!
        inPhotos:[Photo!]!
    }

    type Photo{
        id:ID!
        url:String!
        name:String!
        description:String!
        createdAt:DateTime!
        category: PhotoCategory!
        postedBy:User!
        taggedUsers:[User!]!
    }

    type Query{
        totalPhoto: Int!
        allPhotos:[Photo!]!
    }

    type Mutation{
        postPhoto(input: PhotoPostInput!):Photo!
    }
`

const resolvers = {

    Query: {
        totalPhoto: () => photos.length,
        allPhotos: () => photos
    },

    Mutation: {
        postPhoto(parent, args) {
            var newPhoto = {
                id: _id++,
                ...args.input
            }
            photos.push(newPhoto)
            return newPhoto
        }
    },

    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(user => user.githubLogin = parent.githubUser)
        },
        taggedUsers: tags
            .filter(tag => tag.photoID === parent.id)
            .map(tag => tag.userID)
            .map(userID => users.find(u => u.githubLogin === userID))
    },

    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser == parent.githubLogin)
        },

        inPhotos: parent =>
            tags
            .filter(tag => tag.userID == parent.id)
            .map(tag => tag.photoID)
            .map(photoId => photos.find(p => p.id === photoId))

    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({ url }) => {
    console.log(`GraphQl is running on ${url}`);
})
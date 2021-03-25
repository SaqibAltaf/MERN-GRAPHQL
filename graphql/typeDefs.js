const { gql } = require('apollo-server');

module.exports = gql`

  type Post {
    id: ID!
    body: String!
    createdAt: String
    username: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }
  type User {
    id: ID!
    email: String!
    token: String
    username: String!
    image:String
    createdAt: String!
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type File {
    filename: String
    mimetype:String
    encoding:String
    userId:String
    url:String!
  }
  
  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post
    uploads: [File!]!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    updateProfile(username: String!, password: String!, newPassword:String!): User!
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: String!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
    uploadFile(file: Upload!): File!


  }
  type Subscription {
    newPost: Post!
  }
`;

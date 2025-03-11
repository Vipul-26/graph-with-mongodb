import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  type Query {
    users: [User]
    posts: [Post]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User!
    login(email: String!, password: String!): AuthPayload!
    addPost(title: String!, content: String!): Post!
    deletePost(id: ID!): String!
  }

  type Subscription {
    postAdded: Post
  }
`;

export default typeDefs;

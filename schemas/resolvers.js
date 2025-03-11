import User from "../models/User.js";
import Post from "../models/Post.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PubSub } from "graphql-subscriptions";
import dotenv from "dotenv";

dotenv.config();
const pubsub = new PubSub();

const resolvers = {
  Query: {
    users: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized!");
      return await User.find();
    },
    posts: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized!");
      return await Post.find().populate("author");
    },
  },

  Mutation: {
    register: async (_, { username, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("Email already in use!");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      return user;
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found!");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid password!");

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      return { token, user };
    },

    addPost: async (_, { title, content }, context) => {
      if (!context.user) throw new Error("Unauthorized!");

      const post = new Post({ title, content, author: context.user.id });
      await post.save();

      // Publish Subscription
      pubsub.publish("POST_ADDED", { postAdded: post });

      return post;
    },

    deletePost: async (_, { id }, context) => {
      if (!context.user) throw new Error("Unauthorized!");

      const post = await Post.findById(id);
      if (!post) throw new Error("Post not found!");
      if (post.author.toString() !== context.user.id)
        throw new Error("Not authorized to delete this post!");

      await Post.findByIdAndDelete(id);
      return "Post deleted successfully!";
    },
  },

  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator(["POST_ADDED"]),
    },
  },
};

export default resolvers;

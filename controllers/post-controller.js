const { prisma } = require("../prisma/prisma.client");

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;

    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ err: "Все поля обязательны" });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });

      return res.json(post);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ err: "Internal server error" });
    }
  },
  getAllPosts: async (req, res) => {
    const userId = req.user.userId;

    try {
      const posts = prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const postWithLikeInfog = (await posts).map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }));

      return res.json(postWithLikeInfog);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ err: "Internal server error" });
    }
  },
  getPostById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          comments: {
            include: {
              user: true,
            },
          },
          likes: true,
          author: true,
        },
      });

      if (!post) {
        return res.status(404).json({ err: "Post not found" });
      }

      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      };

      return res.json(postWithLikeInfo);
    } catch (error) {
      console.log(error);
      return res.json(500).json({ err: "internal server error" });
    }
  },
  deletePost: async (req, res) => {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ err: "Post not found" });
    }

    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ err: "Access denied" });
    }

    try {
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
      ]);

      return res.json(transaction);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ err: "Internal server error" });
    }
  },
};

module.exports = PostController;

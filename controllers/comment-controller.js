const { prisma } = require("../prisma/prisma.client");

const CommentController = {
  createComment: async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.userId;

    if (!postId || !content) {
      return req.status(400).json({ err: "Все поля обязательны" });
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
        },
      });

      return res.json(comment);
    } catch (error) {
      console.log(error);
      return res.json(500).json({ err: "Internal server error" });
    }
  },
  deleteComment: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const comment = await prisma.comment.findUnique({
        where: { id },
      });

      if (!comment) {
        return res.status(400).json({ err: "Comment not found" });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ err: "Access denied" });
      }

      await prisma.comment.delete({ where: { id } });

      return res.json(comment);
    } catch (error) {
      console.log(error);
      return res.json(500).json({ err: "Internal server error" });
    }
  },
};

module.exports = CommentController;

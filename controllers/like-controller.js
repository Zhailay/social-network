const { prisma } = require("../prisma/prisma.client");

const LikeController = {
  likePost: async (req, res) => {
    const { postId } = req.body;
    const userId = req.user.userId;

    if (!postId) {
      return res.status(400).json({ err: "Все поля обязательный!" });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId, userId },
      });

      if (existingLike) {
        return res.status(400).json({ err: "Вы уже поставлии лайк" });
      }

      const like = await prisma.like.create({
        data: { postId, userId },
      });

      return res.json(like);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ err: "Internal server error" });
    }
  },
  unlikePost: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ err: "Вы уже поставили дизлайк" });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      });

      if (!existingLike) {
        return res.status(400).json({ err: "Нельзя поставть дизлайк" });
      }

      const like = await prisma.like.deleteMany({
        where: { postId: id, userId },
      });

      return res.json(like);
    } catch (error) {
      console.log(error);
      return res.json(500).json({ err: "Internal server error" });
    }
  },
};

module.exports = LikeController;

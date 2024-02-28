const { prisma } = require("../prisma/prisma.client");

const FollowController = {
  followUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (followingId === userId) {
      return res.status(400).json({ err: "Нельзя подписаться на самого себя" });
    }

    try {
      const existingFollow = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (existingFollow) {
        return res.status(400).json({ err: "Подписка уже сущевствует" });
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });

      return res.status(201).json({ message: "успешно подписан" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ err: "Internal server error" });
    }
  },
  unfollowUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (!follows) {
        return res.status(404).json({ err: "Вы не подписаны!" });
      }

      await prisma.follows.delete({
        where: { id: follows.id },
      });

      return res.status(201).json({ message: "успешно отписан!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ err: "Internal server error" });
    }
  },
};

module.exports = FollowController;

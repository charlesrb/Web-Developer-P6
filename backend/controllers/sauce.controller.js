const sauceModel = require("../models/sauce.model");
const fs = require("fs");
const { request } = require("http");

exports.create = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new sauceModel({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error: "grosse erreur" }));
};

module.exports.list = async (req, res) => {
  sauceModel
    .find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

module.exports.listOne = (req, res) => {
  sauceModel
    .findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

module.exports.delete = (req, res) => {
  sauceModel
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("images/")[1];
      fs.unlink(`images/${filename}`, () => {
        sauceModel
          .deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

module.exports.update = (req, res) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  sauceModel
    .updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce modifée" }))
    .catch((error) => res.status(400).json({ error }));
};

module.exports.like = (req, res) => {
  let like = req.body.like;
  if (like === 1) {
    sauceModel
      .updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: req.body.like++ },
          $push: { usersLiked: req.body.userId },
        }
      )
      .then(() => res.status(200).json({ message: "like ajouté !" }))
      .catch((error) => res.status(400).json(error));
  }
  if (like === -1) {
    sauceModel
      .updateOne(
        { _id: req.params.id },
        { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } }
      )
      .then(() => res.status(200).json({ message: "dislike ajouté !" }))
      .catch((error) => res.status(400).json(error));
  } else {
    sauceModel
      .findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.includes(req.body.userId)) {
          sauceModel
            .updateOne(
              { _id: req.params.id },
              {
                $pull: { usersLiked: req.body.userId },
                $inc: { likes: -1 },
              }
            )
            .then(() => res.status(200).json({ message: "Like retiré" }))
            .catch((error) => res.status(400).json(error));
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          sauceModel
            .updateOne(
              { _id: req.params.id },
              {
                $pull: { usersDisliked: req.body.userId },
                $inc: { dislikes: -1 },
              }
            )
            .then(() => res.status(200).json({ message: "Dislike retiré" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};

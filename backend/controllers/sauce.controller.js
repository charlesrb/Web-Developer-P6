const sauceModel = require("../models/sauce.model");
const fs = require("fs");
const { request } = require("http");

// Création de sauce
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

// Affichage des sauces
module.exports.list = async (req, res) => {
  sauceModel
    .find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Affichage d'une seule sauce
module.exports.listOne = (req, res) => {
  sauceModel
    .findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

// Suppression d'une sauce
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

// Mise à jour d'une sauce
module.exports.update = (req, res, next) => {
  sauceModel.findOne({ _id: req.params.id }).then((sauce) => {
    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
      const sauceObject = req.file
        ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          }
        : { ...req.body };
      sauceModel
        .updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
        .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
        .catch((error) => res.status(400).json({ error }));
    });
  });
};

// Like ou Dislike
module.exports.like = (req, res) => {
  let like = req.body.like;
  if (like === 1) {
    sauceModel
      .updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: +1 },
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
        {
          $inc: { dislikes: +1 },
          $push: { usersDisliked: req.body.userId },
        }
      )
      .then(() => res.status(200).json({ message: "dislike ajouté !" }))
      .catch((error) => res.status(400).json(error));
  }
  if (like === 0) {
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
        }
        if (sauce.usersDisliked.includes(req.body.userId)) {
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

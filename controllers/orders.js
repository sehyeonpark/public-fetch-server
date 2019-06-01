const db = require("../models");
// const fs = require("fs");
// const path = require("path");

module.exports = {
  list: {
    get: async (req, res) => {
      try {
        let order = {
          orderList: []
        };
        let list = await db.orders.findAll();
        list.map(item => {
          let temp = {
            order_id: item.dataValues._id,
            productName: item.dataValues.name,
            // imageUrl: "http://localhost:3001/public/image/gucci.jpg",
            destination: item.dataValues.destination,
            price: item.dataValues.price,
            due: item.dataValues.due,
            status: item.dataValues.status
          };
          order.orderList.push(temp);
        });

        for (let i = 0; i < order.orderList.length; i++) {
          let imgUrl = await db.productimgs.findOne({
            where: { order_id: order.orderList[i].order_id },
            attributes: ["imgUrl"]
          });
          order.orderList[i].imageUrl = imgUrl.imgUrl;
        }

        order.orderList.reverse();

        if (req.query.max) {
          order.orderList = order.orderList.splice(0, req.query.max);
          res.send(order);
        } else {
          res.send(order);
        }
      } catch (err) {
        console.log("ERROR ::: ", err);
      }

      // res.status(201).send("GET /orders/list OK!");
    }
  },
  detail: {
    get: async (req, res) => {
      try {
        let orderDetail = {
          requester: {}
        };
        let tempArr = [];

        let list = await db.orders.findOne({
          where: { _id: req.query.order_id }
        });

        let user = await db.users.findOne({
          where: {
            _id: list.dataValues.buyer_id
          }
        });

        let imageList = await db.productimgs.findAll({
          where: {
            order_id: list._id
          },
          attributes: ["imgUrl"]
        });

        for (let i = 0; i < imageList.length; i++) {
          tempArr.push(imageList[i].dataValues.imgUrl);
        }

        orderDetail.productName = list.dataValues.name;
        orderDetail.destination = list.dataValues.destination;
        orderDetail.price = list.dataValues.price;
        orderDetail.quantity = list.dataValues.quantity;
        orderDetail.referenceUrl = list.dataValues.referenceUrl;
        orderDetail.description = list.dataValues.description;
        orderDetail.requester.ID = user.dataValues._id;
        orderDetail.requester.imageUrl = user.dataValues.image;
        orderDetail.requester.name = user.dataValues.name;
        orderDetail.imageUrls = tempArr;

        res.status(200).send(orderDetail);
      } catch (err) {
        console.log("ERROR ::: ", err);
        res.status(400).send(err);
      }

      // res.status(200).send("GET /orders/detail OK!");
    }
  },
  create: {
    post: (req, res) => {
      let temp = req.body;
      db.orders
        .create({
          name: temp.productName,
          destination: temp.destination,
          price: temp.price,
          due: temp.due,
          quantity: temp.quantity,
          preferParcel: temp.preferParcel,
          description: temp.description,
          buyer_id: 3
        })
        .then(() => {
          res.status(201).send("POST /orders/create OK!");
        })
        .catch(err => {
          res.status(400).send(err);
          console.log(err);
        });
    }
  },
  addapplier: {
    post: (req, res) => {
      res.status(201).send("POST /orders/addapplier OK!");
    }
  },
  pickfetcher: {
    post: (req, res) => {
      res.status(201).send("POST /orders/pickfetcher OK!");
    }
  }
};

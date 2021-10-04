const {Order} = require("../model/Order");
const dbController = require("./dbController")

const getOrder = (req, res) => {
    let userOrders = [];
    dbController.orders_by_user(req.session.user.id)
        .then(orderArr => {
            dbController.get_orders(orderArr)
                .then(data => {
                    console.log(data)
                    userOrders = data
                    res.render('pages/order', {orders: userOrders});
                })
        }).catch(err => console.error(err));
}

const getSingleOrder = (req, res) => {
    const order_id = req.params.id
    dbController.get_orders([order_id])
        .then(orders => {
            let firstOrder = orders[0]
            res.render("pages/viewOrder", {order: firstOrder})
        })
}

const addOrder = (req, res) => {
    if (!req.session?.cart?.length > 0) return res.send("You have no items in your cart to purchase")
    const artwork_ids = req.session.cart.map(art => art.id);
    dbController.add_order(req.session.user.id, artwork_ids)
        .catch(err => console.error(err));
    res.redirect("/");
}

module.exports = {
    getOrder,
    addOrder,
    getSingleOrder
}
//var mongoose=require("mongoose");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let ItemSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity can not be less then 1.']
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
})
const CartSchema = new Schema({
    items: [ItemSchema],
    subTotal: {
        default: 0,
        type: Number
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('cart', CartSchema);


//module.exports = function Cart(oldCart) {
//CartSchema.methods.addToCart = function(product) {
module.exports = function Cart(cart) {
    this.items = cart.items || {};
    this.totalItems = cart.totalItems || 0;
    this.totalPrice = cart.totalPrice || 0;

    this.add = function (item, id) {
        var storedItem = this.items[id];
    
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 }
        }
        cartItem.quantity++;
        cartItem.price = cartItem.item.price * cartItem.quantity;
        this.totalItems++;
        this.totalPrice += cartItem.item.price;
    };

    this.remove = function(id) {
        this.totalItems -= this.items[id].quantity;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };
    
    this.getItems = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};
module.exports = mongoose.model('cart', CartSchema);
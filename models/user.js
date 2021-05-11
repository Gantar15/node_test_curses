const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExp: Date,
    avatarUrl: String,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Course'
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function (course) {
    const items = this.cart.items.slice(0);
    const indx = items.findIndex(el => el.courseId.toString() === course._id.toString());
    
    if(~indx){
        ++items[indx].count;
    } else{
        items.push({
            courseId: course._id,
            count: 1
        });
    }

    this.cart = {items};
    return this.save();
}

userSchema.methods.removeFromCart = function (courseId) {
    const items = [...this.cart.items];
    const indx = items.findIndex(el => el.courseId.toString() === courseId.toString());

    if(items[indx]){
        if(items[indx].count > 1){
            --items[indx].count;
        }
        else{
            items.splice(indx, 1);
        }
    }

    this.cart = {items};
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart.items = [];
    return this.save();
}

module.exports = model('User', userSchema);
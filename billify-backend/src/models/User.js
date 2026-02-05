const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', function (next) {
    console.log('📝 User pre-save hook started...');
    const user = this;
    if (!user.isModified('password')) {
        console.log('📝 Password not modified, skipping hash');
        return next();
    }

    console.log('📝 Hashing password...');
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            console.error('❌ genSalt Error:', err);
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                console.error('❌ hash Error:', err);
                return next(err);
            }
            user.password = hash;
            console.log('✅ Password hashed successfully');
            next();
        });
    });
});

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

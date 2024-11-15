import * as jwt from 'jsonwebtoken'
import * as jwt from 'jsonwebtoken'
const app = require('express')
const User = require('./models/user')


app.post('/register', async (res, req) => {

    try {
        const { username, name, email, password } = req.body

        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        const hashedPassword = bcrypt.hashSync(password, 8)

        let user = new User({
            username,
            name,
            email,
            password: hashedPassword
        })


        user = await user.save()
        if (!user) {
            return res.status(400).json({ message: "Something went wrong" })
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }



})


app.post('/login', async (res, req) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" })
        }

        const token = jwt.sign({ id: user._id }, "passwordKey", { expiresIn: "1d" })

        res.json({ token, ...user._doc })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})
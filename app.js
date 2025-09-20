const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const conn = require('./config/connection.js')
const cors = require('cors');
const Path = require('path');
const adminRoutes = require('./routes/admin.route.js');
const cookieParser = require('cookie-parser');
const productModel = require('./models/products.model.js');
const isLoggedIn = require('./middlewares/isLoggedIn.js');
const orderModel = require('./models/orders.model.js');
// const helmet = require("helmet");


app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, 'public')));
app.use(cookieParser());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       imgSrc: ["'self'", "data:", "blob:"],
//       connectSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; " +
//       "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
//       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
//       "font-src 'self' https://fonts.gstatic.com data:; " +
//       "img-src 'self' data: blob:; " +
//       "connect-src 'self'; " +
//       "object-src 'none'; " +
//       "frame-ancestors 'self'; " +
//       "base-uri 'self'; " +
//       "form-action 'self';"
//   );
//   next();
// });


app.use('/admin', adminRoutes);


app.get('/:number', async (req, res) => {
  const number = req.params.number;
  if (isNaN(number)) {
    return res.status(400).send('Invalid URL');
  }
  res.render('index', { number });
});

app.get('/menu/content',async (req, res) => {
  const menus =await productModel.find({availability:true})
  res.send({menus});
})



app.get('/get/products', async (req, res) => {
    const products = await productModel.find();
    res.send(products);
});


app.post('/place/order', async (req, res) => {
  const { custName, custEmail, instructions, cart, subtotal, tax, total, tableNumber } = req.body;
  // cart should be [{ product: ObjectId, quantity: Number }]
  console.log(req.body)
  const order = await orderModel.create({
    name:custName,
    email:custEmail,
    instructions,
    total,
    cart,
    time: new Date(),
    tableNumber
  });

  res.json({ message: "Order placed successfully!" });
});


app.get('/get/orders',isLoggedIn,async (req,res)=>{
  const orders = await orderModel.find().populate('cart.product')

  res.send(orders)
})



app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
});
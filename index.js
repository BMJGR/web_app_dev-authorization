const express = require('express');
const app = express();
const Blog = require("./blog.model");
const jwt = require("jsonwebtoken");
const verifyToken = require("./verify-token");
const protectedRoutes = require("./protected-routes");
const publicRoutes = require("./public-routes");

const PORT = 8080, SECRET_KEY = 'abc', TOKEN_HEADER = 'auth';

app.use(express.json());
app.use(protectedRoutes);
app.use(publicRoutes);


app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
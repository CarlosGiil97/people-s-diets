const express = require("express");
const app = express();
const bodyParser = require('body-parser');

//para hashear la password
const bcrypt = require("bcrypt");

//tokenizar
const jwt = require("jsonwebtoken");

const auth = require("./auth");

const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");

dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});


//endpoint para el registro de usuarios
app.post("/register", (request, response) => {

  // convrtir la contraseña a hash
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // se crea un objeto de tipo usuario con los parametros recibidos
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // se guarda el usuario
      user
        .save()
        // devuelve true si todo ha ido bien en la inserción
        .then((result) => {
          response.status(201).send({
            message: "Usuario creado con éxito",
            result,
          });
        })
        // capturar el error
        .catch((error) => {
          response.status(500).send({
            message: "Error creando el usuario",
            error,
          });
        });
    })
    // caso de que haya habido error con el hash de la contraseña
    .catch((e) => {
      response.status(500).send({
        message: "La contraseña no se ha hasheado bien",
        e,
      });
    });
});

//endpoint para la comprobación del logeo

app.post("/login", (request, response) => {

  //comprobar si existe el mail
  User.findOne({ email: request.body.email })

    // si el email existe, entro
    .then((user) => {
      
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          //comprobar si las contraseñas coinciden
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Contraseñas no coinciden",
              error,
            });
          }

          //crear JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //devolver mensaje de exito
          response.status(200).send({
            message: "Login ok",
            email: user.email,
            token,
          });
        })
        // error si la contraseña no coincide
        .catch((error) => {
          response.status(400).send({
            message: "Las contraseñas no coinciden",
            error,
          });
        });
    })
    //error si el email no existe
    .catch((e) => {
      response.status(404).send({
        message: "Email no encontrado",
        e,
      });
    });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});



module.exports = app;